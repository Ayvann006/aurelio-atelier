import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

function isAuthorized(req: NextRequest) {
  const token = req.headers.get('x-admin-token') || req.cookies.get('admin_auth')?.value
  return token === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('configuracion_sitio').select('*').eq('id', 1).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? {})
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const updates = await req.json()
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('configuracion_sitio')
    .upsert({ id: 1, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
