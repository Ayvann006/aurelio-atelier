import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isAuthorized } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { base64, nombre, cliente_id, tipo } = await req.json()
  const supabase = createServiceClient()

  const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
  if (!matches) return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })

  const mimeType = matches[1]
  const buffer = Buffer.from(matches[2], 'base64')
  const ext = mimeType.split('/')[1] || 'jpg'
  const fileName = `fichas/${cliente_id}/${tipo}/${Date.now()}-${nombre}.${ext}`

  const { error: uploadError } = await supabase.storage.from('imagenes').upload(fileName, buffer, { contentType: mimeType })
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: urlData } = supabase.storage.from('imagenes').getPublicUrl(fileName)

  const { data, error } = await supabase.from('archivos_clienta').insert({
    cliente_id, nombre, url: urlData.publicUrl, tipo,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await req.json()
  const supabase = createServiceClient()
  await supabase.from('archivos_clienta').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
