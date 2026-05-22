import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isAuthorized } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const body = await req.json()
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('medidas').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // Registrar en historial
  await supabase.from('historial_proyecto').insert({
    cliente_id: body.cliente_id,
    evento: 'Medidas registradas',
    descripcion: 'Se cargaron las medidas de la clienta',
  })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id, ...updates } = await req.json()
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('medidas').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await req.json()
  const supabase = createServiceClient()
  await supabase.from('medidas').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
