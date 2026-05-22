import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

function isAuthorized(req: NextRequest) {
  const token = req.headers.get('x-admin-token') || req.cookies.get('admin_auth')?.value
  return token === process.env.ADMIN_PASSWORD
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { base64, nombre } = await req.json()
    if (!base64 || !nombre) return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })

    // Convertir base64 a buffer
    const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
    if (!matches) return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })

    const mimeType = matches[1]
    const buffer = Buffer.from(matches[2], 'base64')
    const ext = mimeType.split('/')[1] || 'jpg'
    const fileName = `productos/${Date.now()}-${nombre.replace(/[^a-z0-9.]/gi, '-').toLowerCase()}.${ext}`

    const supabase = createServiceClient()

    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from('imagenes')
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: false,
      })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('imagenes')
      .getPublicUrl(fileName)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al subir imagen' }, { status: 500 })
  }
}
