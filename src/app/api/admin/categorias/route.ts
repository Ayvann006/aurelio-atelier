import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

function isAuthorized(req: NextRequest) {
  const token = req.headers.get('x-admin-token') || req.cookies.get('admin_auth')?.value
  return token === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const supabase = createServiceClient()
  const { data } = await supabase.from('categorias_producto').select('*').order('nombre')
  // Merge with default categories
  const defaults = [
    { id: 'batas', nombre: 'Batas', slug: 'batas', default: true },
    { id: 'tiaras', nombre: 'Tiaras', slug: 'tiaras', default: true },
    { id: 'tocados', nombre: 'Tocados', slug: 'tocados', default: true },
    { id: 'accesorios', nombre: 'Accesorios', slug: 'accesorios', default: true },
  ]
  const custom = data ?? []
  return NextResponse.json([...defaults, ...custom])
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { nombre } = await req.json()
  const slug = nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('categorias_producto').insert({ nombre, slug }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await req.json()
  if (['batas','tiaras','tocados','accesorios'].includes(id)) {
    return NextResponse.json({ error: 'No se puede eliminar una categoría predeterminada' }, { status: 400 })
  }
  const supabase = createServiceClient()
  await supabase.from('categorias_producto').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
