import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isAuthorized } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const body = await req.json()
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('presupuestos').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await supabase.from('historial_proyecto').insert({
    cliente_id: body.cliente_id,
    evento: 'Presupuesto creado',
    descripcion: `Presupuesto ${data.numero} por ${body.precio_total}`,
  })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id, cliente_id, ...updates } = await req.json()
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('presupuestos').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (updates.estado && cliente_id) {
    await supabase.from('historial_proyecto').insert({
      cliente_id,
      evento: `Presupuesto ${updates.estado}`,
      descripcion: `El presupuesto fue marcado como ${updates.estado}`,
    })
    // Actualizar estado del proyecto automáticamente
    if (updates.estado === 'aprobado') {
      await supabase.from('clientes').update({ estado_proyecto: 'presupuesto-aprobado' }).eq('id', cliente_id)
    }
  }
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await req.json()
  const supabase = createServiceClient()
  await supabase.from('presupuestos').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
