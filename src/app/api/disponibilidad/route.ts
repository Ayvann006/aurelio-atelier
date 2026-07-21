import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getHorariosDisponibles, cumpleAntelacionMinima, duracionCita, horaAMinutos } from '@/lib/utils'
import { esPedidoDelAdmin } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  const fecha = req.nextUrl.searchParams.get('fecha')
  if (!fecha) return NextResponse.json({ error: 'Fecha requerida' }, { status: 400 })

  const supabase = createServiceClient()

  // Horarios base según el día
  const horariosBase = getHorariosDisponibles(fecha)
  if (horariosBase.length === 0) {
    return NextResponse.json({ disponibles: [], bloqueado: true, motivo: 'Día no laborable' })
  }

  // Verificar si el día está bloqueado completo
  const { data: bloqueadoTotal } = await supabase
    .from('horarios_bloqueados')
    .select('*')
    .eq('fecha', fecha)
    .eq('todo_el_dia', true)
    .maybeSingle()

  if (bloqueadoTotal) {
    return NextResponse.json({ disponibles: [], bloqueado: true, motivo: bloqueadoTotal.motivo || 'Día bloqueado' })
  }

  // Obtener citas existentes ese día. Cada una ocupa según su duración real
  // (ej: una "Prueba de Vestido" son 90min y tapa también el turno siguiente).
  const { data: citasDelDia } = await supabase
    .from('citas')
    .select('hora, tipo_cita')
    .eq('fecha', fecha)
    .neq('estado', 'cancelada')

  const rangosOcupados = (citasDelDia || []).map((c) => {
    const inicio = horaAMinutos(c.hora.substring(0, 5))
    return { inicio, fin: inicio + duracionCita(c.tipo_cita) }
  })

  // Obtener horarios bloqueados parciales
  const { data: bloqueados } = await supabase
    .from('horarios_bloqueados')
    .select('hora_inicio, hora_fin')
    .eq('fecha', fecha)
    .eq('todo_el_dia', false)

  // Regla de antelación mínima de 4hs (no aplica si es el propio admin agendando)
  const esAdmin = esPedidoDelAdmin(req)

  const disponibles = horariosBase.filter((h) => {
    const hMin = horaAMinutos(h)
    if (rangosOcupados.some((r) => hMin >= r.inicio && hMin < r.fin)) return false
    if (bloqueados?.some((b) => {
      const hInicio = b.hora_inicio?.substring(0, 5)
      const hFin = b.hora_fin?.substring(0, 5)
      return hInicio && hFin && h >= hInicio && h < hFin
    })) return false
    if (!esAdmin && !cumpleAntelacionMinima(fecha, h)) return false
    return true
  })

  return NextResponse.json({ disponibles })
}
