import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

function isAuthorized(req: NextRequest) {
  const token = req.headers.get('x-admin-token') || req.cookies.get('admin_auth')?.value
  return token === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const supabase = createServiceClient()
  const id = req.nextUrl.searchParams.get('id')
  if (id) {
    const { data } = await supabase.from('clientes').select('*').eq('id', id).single()
    return NextResponse.json(data)
  }
  const { data } = await supabase.from('clientes').select('*').order('nombre')
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const body = await req.json()
  const supabase = createServiceClient()
  // Upsert por email
  const { data, error } = await supabase
    .from('clientes')
    .upsert(body, { onConflict: 'email' })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id, ...updates } = await req.json()
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('clientes').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await req.json()
  const supabase = createServiceClient()
  await supabase.from('clientes').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
