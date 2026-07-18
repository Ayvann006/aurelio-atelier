import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { generarEmailRecordatorio, enviarTelegram } from '@/lib/notificaciones'

export const dynamic = 'force-dynamic'

// Vercel Cron llama a esta ruta una vez por dia (ver vercel.json) mandando
// el header Authorization: Bearer <CRON_SECRET>. Verificamos ese secreto para
// que nadie mas pueda disparar este endpoint desde afuera.
function isAuthorized(req: NextRequest) {
  const auth = req.headers.get('authorization')
  return auth === `Bearer ${process.env.CRON_SECRET}`
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()

  // "Mañana" en fecha calendario. El cron esta programado para correr a media
  // mañana en hora Argentina, momento en el que la fecha UTC y la fecha ART
  // coinciden, asi que no hace falta convertir zona horaria.
  const hoy = new Date()
  const manana = new Date(hoy)
  manana.setUTCDate(hoy.getUTCDate() + 1)
  const fechaManana = manana.toISOString().split('T')[0]

  const { data: citas, error } = await supabase
    .from('citas')
    .select('*')
    .eq('fecha', fechaManana)
    .neq('estado', 'cancelada')
    .order('hora', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!citas || citas.length === 0) {
    await enviarTelegram(`📋 Sin citas agendadas para mañana (${fechaManana})`)
    return NextResponse.json({ ok: true, total: 0 })
  }

  let emailsEnviados = 0
  for (const cita of citas) {
    if (process.env.RESEND_API_KEY) {
      try {
        const { html, subject } = generarEmailRecordatorio({
          cliente_nombre: cita.cliente_nombre,
          fecha: cita.fecha,
          hora: cita.hora,
          tipo_cita: cita.tipo_cita,
          tipo_evento: cita.tipo_evento,
          id: cita.id,
        })
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || 'hola@aureliomartinez.com',
            to: cita.cliente_email,
            subject,
            html,
          }),
        })
        if (res.ok) emailsEnviados++
      } catch (e) {
        console.error('Error enviando recordatorio por email:', e)
      }
    }
  }

  // Resumen del dia siguiente para el atelier, con link directo a WhatsApp de cada clienta
  const resumen = citas
    .map((c) => `• ${c.hora?.substring(0, 5)} hs — ${c.cliente_nombre} (${c.tipo_cita.replace(/-/g, ' ')})\nhttps://wa.me/${c.cliente_telefono.replace(/\D/g, '')}`)
    .join('\n\n')
  await enviarTelegram(`📋 Citas de mañana (${fechaManana}) — ${citas.length}\n\n${resumen}`)

  return NextResponse.json({ ok: true, total: citas.length, emails_enviados: emailsEnviados })
}
