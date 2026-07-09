import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Devuelve las fechas bloqueadas por completo (todo_el_dia = true), para que
// el calendario público pueda mostrarlas como no disponibles sin necesidad
// de que la clienta haga click en cada día para descubrirlo.
export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('horarios_bloqueados')
    .select('fecha')
    .eq('todo_el_dia', true)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const fechas = Array.from(new Set((data ?? []).map((d: any) => d.fecha)))
  return NextResponse.json({ fechas })
}
