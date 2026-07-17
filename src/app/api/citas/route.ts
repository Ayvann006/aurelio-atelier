import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { crearPreferenciaCita } from '@/lib/mercadopago'
import { generarMensajeWA, generarEmailCita, enviarNotificacionPushCita } from '@/lib/notificaciones'
import { z } from 'zod'
import { getHorariosDisponibles } from '@/lib/utils'

const citaSchema = z.object({
  cliente_nombre: z.string().min(2),
  cliente_email: z.string().email(),
  cliente_telefono: z.string().min(8),
  tipo_evento: z.enum(['novia', 'quinceanera', 'gala', 'miss', 'otro']),
  tipo_cita: z.enum(['primera-entrevista', 'prueba', 'ajuste', 'entrega']),
  fecha: z.string(),
  hora: z.string(),
  notas: z.string().optional(),
  pagar_sena: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = citaSchema.parse(body)
    const supabase = createServiceClient()

    // Verificar que la fecha/hora esté dentro del horario de atención
    const horariosDelDia = getHorariosDisponibles(data.fecha)
    if (!horariosDelDia.includes(data.hora)) {
      return NextResponse.json({ error: 'Ese horario está fuera del horario de atención' }, { status: 409 })
    }

    // Verificar que el día/horario no esté bloqueado desde el admin
    const { data: bloqueosDelDia } = await supabase
      .from('horarios_bloqueados')
      .select('todo_el_dia, hora_inicio, hora_fin')
      .eq('fecha', data.fecha)

    const diaBloqueado = bloqueosDelDia?.some((b) => b.todo_el_dia)
    if (diaBloqueado) {
      return NextResponse.json({ error: 'Ese día no está disponible para agendar' }, { status: 409 })
    }
    const horaBloqueada = bloqueosDelDia?.some((b) => {
      if (b.todo_el_dia) return false
      const hInicio = b.hora_inicio?.substring(0, 5)
      const hFin = b.hora_fin?.substring(0, 5)
      return hInicio && hFin && data.hora >= hInicio && data.hora < hFin
    })
    if (horaBloqueada) {
      return NextResponse.json({ error: 'Ese horario no está disponible' }, { status: 409 })
    }

    // Verificar disponibilidad (que no haya otra cita en ese horario)
    const { data: existente } = await supabase
      .from('citas')
      .select('id')
      .eq('fecha', data.fecha)
      .eq('hora', data.hora)
      .neq('estado', 'cancelada')
      .maybeSingle()

    if (existente) {
      return NextResponse.json({ error: 'Horario no disponible' }, { status: 409 })
    }

    // Registrar clienta automáticamente
    let clienteId = null
    try {
      const { data: cliente } = await supabase
        .from('clientes')
        .upsert({
          nombre: data.cliente_nombre,
          email: data.cliente_email,
          telefono: data.cliente_telefono,
          tipo_evento_habitual: data.tipo_evento,
        }, { onConflict: 'email' })
        .select('id')
        .single()
      clienteId = cliente?.id
    } catch (e) { /* continúa igual */ }

    const { pagar_sena, ...datosCita } = data

    // Crear cita
    const { data: cita, error } = await supabase
      .from('citas')
      .insert({
        ...datosCita,
        estado: 'confirmada',
        sena_pagada: false,
        monto_sena: 10000,
        ...(clienteId ? { cliente_id: clienteId } : {}),
      })
      .select()
      .single()

    if (error) throw error

    // Pago de seña opcional
    let mp_url = null
    if (pagar_sena) {
      try {
        const preferencia = await crearPreferenciaCita({
          id: cita.id,
          cliente: { nombre: data.cliente_nombre, email: data.cliente_email },
          fecha: data.fecha,
          hora: data.hora,
          monto: 10000,
        })
        mp_url = preferencia.init_point
        await supabase.from('citas').update({ mp_preference_id: preferencia.id }).eq('id', cita.id)
      } catch (mpError: any) {
        console.error('Error MP cita:', mpError)
      }
    }

    // ── Notificaciones ──
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Notificación push al celular del atelier.
    // OJO: se espera (await) a propósito — en Vercel (serverless) si no se espera
    // una llamada async antes de responder, la función puede cortarse apenas se
    // manda la respuesta y la notificación queda a mitad de camino sin llegar a salir.
    try {
      await enviarNotificacionPushCita({
        cliente_nombre: data.cliente_nombre,
        cliente_telefono: data.cliente_telefono,
        fecha: data.fecha,
        hora: data.hora,
        tipo_evento: data.tipo_evento,
        tipo_cita: data.tipo_cita,
        notas: data.notas,
      })
    } catch (e) {
      console.error('Error notificacion push:', e)
    }

    // WhatsApp para la clienta (link directo)
    const msgClienta = generarMensajeWA({
      cliente_nombre: data.cliente_nombre,
      fecha: data.fecha,
      hora: data.hora,
      tipo_cita: data.tipo_cita,
      tipo_evento: data.tipo_evento,
      id: cita.id,
    })
    const waClientaLink = `https://wa.me/${data.cliente_telefono.replace(/\D/g, '')}?text=${encodeURIComponent(msgClienta)}`

    // WhatsApp notificación interna al atelier
    const msgAtelier = `🌹 *Nueva cita confirmada*\n\n👤 ${data.cliente_nombre}\n📱 ${data.cliente_telefono}\n📧 ${data.cliente_email}\n📅 ${data.fecha} a las ${data.hora} hs\n🎭 Evento: ${data.tipo_evento}\n✂️ Cita: ${data.tipo_cita}\n💬 ${data.notas || 'Sin notas'}`
    const waAtelierLink = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER}?text=${encodeURIComponent(msgAtelier)}`

    // Email (si está configurado Resend)
    let emailEnviado = false
    if (process.env.RESEND_API_KEY) {
      try {
        const { html, subject } = generarEmailCita({
          cliente_nombre: data.cliente_nombre,
          fecha: data.fecha,
          hora: data.hora,
          tipo_cita: data.tipo_cita,
          tipo_evento: data.tipo_evento,
          id: cita.id,
        })
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || 'hola@aureliomartinez.com',
            to: data.cliente_email,
            subject,
            html,
          }),
        })
        emailEnviado = emailRes.ok
      } catch (e) {
        console.error('Error email:', e)
      }
    }

    return NextResponse.json({
      success: true,
      cita,
      mp_url,
      email_enviado: emailEnviado,
      wa_clienta: waClientaLink,
      wa_atelier: waAtelierLink,
      link_cita: `${appUrl}/mi-cita/${cita.id}`,
    })
  } catch (error: any) {
    console.error('Error cita:', error)
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('x-admin-token')
  if (token !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('citas')
    .select('*')
    .order('fecha', { ascending: true })
    .order('hora', { ascending: true })
  return NextResponse.json(data)
}
