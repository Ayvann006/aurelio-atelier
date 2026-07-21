import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getHorariosDisponibles, cumpleAntelacionMinima } from '@/lib/utils'
import { isAuthorized } from '@/lib/adminAuth'

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

  // Obtener citas existentes ese día (ocupan 1 hora cada una)
  const { data: citasDelDia } = await supabase
    .from('citas')
    .select('hora')
    .eq('fecha', fecha)
    .neq('estado', 'cancelada')

  const horasOcupadas = citasDelDia?.map((c) => c.hora.substring(0, 5)) || []

  // Obtener horarios bloqueados parciales
  const { data: bloqueados } = await supabase
    .from('horarios_bloqueados')
    .select('hora_inicio, hora_fin')
    .eq('fecha', fecha)
    .eq('todo_el_dia', false)

  // Regla de antelación mínima de 4hs (no aplica si es el propio admin agendando)
  const esAdmin = isAuthorized(req)

  const disponibles = horariosBase.filter((h) => {
    if (horasOcupadas.includes(h)) return false
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
