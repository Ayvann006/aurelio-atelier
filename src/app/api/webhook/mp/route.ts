import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { obtenerPago } from '@/lib/mercadopago'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createServiceClient()
    if (body.type === 'payment' && body.data?.id) {
      const pago = await obtenerPago(body.data.id.toString())
      const ref = pago.external_reference
      if (ref?.startsWith('cita-')) {
        const citaId = ref.replace('cita-', '')
        await supabase.from('citas').update({
          sena_pagada: pago.status === 'approved',
          mp_payment_id: pago.id?.toString(),
        }).eq('id', citaId)
      } else if (ref) {
        const nuevoEstado = pago.status === 'approved' ? 'pagado' : 'pendiente'
        await supabase.from('pedidos').update({
          estado: nuevoEstado,
          mp_payment_id: pago.id?.toString(),
          mp_status: pago.status,
        }).eq('id', ref)
      }
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
