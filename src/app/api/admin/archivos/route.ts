import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase not configured')
  return createClient(url, key)
}

function isAuthorized(req: NextRequest) {
  const token = req.headers.get('x-admin-token') || req.cookies.get('admin_auth')?.value
  return token === process.env.ADMIN_PASSWORD
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { base64, nombre, cliente_id, tipo } = await req.json()
  const supabase = getSupabase()
  const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
  if (!matches) return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
  const mimeType = matches[1]
  const buffer = Buffer.from(matches[2], 'base64')
  const ext = mimeType.split('/')[1] || 'jpg'
  const fileName = `fichas/${cliente_id}/${tipo}/${Date.now()}-${nombre}.${ext}`
  const { error: uploadError } = await supabase.storage.from('imagenes').upload(fileName, buffer, { contentType: mimeType })
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })
  const { data: urlData } = supabase.storage.from('imagenes').getPublicUrl(fileName)
  return NextResponse.json({ url: urlData.publicUrl })
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await req.json()
  const supabase = getSupabase()
  await supabase.from('archivos_clienta').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}