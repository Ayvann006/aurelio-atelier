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
          mp_status_detail: pago.status_detail || null,
          mp_payment_method: pago.payment_method_id || null,
          mp_payment_type: pago.payment_type_id || null,
          mp_transaction_amount: pago.transaction_amount || null,
          mp_net_received: pago.transaction_details?.net_received_amount || null,
          mp_fee_amount: pago.fee_details?.[0]?.amount || null,
          mp_date_approved: pago.date_approved || null,
          mp_payer_email: pago.payer?.email || null,
        }).eq('id', ref)

        // Descontar stock
        if (pago.status === 'approved') {
          const { data: pedido } = await supabase.from('pedidos').select('items').eq('id', ref).single()
          if (pedido?.items) {
            for (const item of pedido.items as any[]) {
              const { data: prod } = await supabase.from('productos').select('stock').eq('id', item.producto_id).single()
              if (prod) {
                await supabase.from('productos').update({ stock: Math.max(0, prod.stock - item.cantidad) }).eq('id', item.producto_id)
              }
            }
          }
        }