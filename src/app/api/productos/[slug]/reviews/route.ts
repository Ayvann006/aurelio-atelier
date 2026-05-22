import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { z } from 'zod'

const schema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  estrellas: z.number().min(1).max(5),
  comentario: z.string().min(5),
})

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = createServiceClient()
  const { data: producto } = await supabase.from('productos').select('id').eq('slug', params.slug).single()
  if (!producto) return NextResponse.json([])
  const { data } = await supabase.from('reviews_productos').select('*').eq('producto_id', producto.id).eq('activo', true).order('created_at', { ascending: false })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json()
    const data = schema.parse(body)
    const supabase = createServiceClient()
    const { data: producto } = await supabase.from('productos').select('id').eq('slug', params.slug).single()
    if (!producto) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    const { data: review, error } = await supabase.from('reviews_productos').insert({ ...data, producto_id: producto.id }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(review)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
