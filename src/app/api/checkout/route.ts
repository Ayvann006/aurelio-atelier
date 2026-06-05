import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { crearPreferenciaPedido } from '@/lib/mercadopago'
import { z } from 'zod'

const checkoutSchema = z.object({
  cliente_nombre: z.string().min(2),
  cliente_email: z.string().email(),
  cliente_telefono: z.string().min(8),
  provincia_envio: z.string().optional(),
  ciudad_envio: z.string().optional(),
  direccion_envio: z.string().optional(),
  codigo_postal: z.string().optional(),
  costo_envio: z.number().optional(),
  items: z.array(z.object({
    producto_id: z.string(),
    nombre: z.string(),
    precio: z.number(),
    cantidad: z.number(),
    variante: z.string().optional(),
    imagen: z.string().optional(),
  })),
  subtotal: z.number(),
  descuento: z.number().optional(),
  cupon_codigo: z.string().optional(),
  total: z.number(),
  notas: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = checkoutSchema.parse(body)
    const supabase = createServiceClient()

    // Verificar stock
    for (const item of data.items) {
      const { data: producto } = await supabase
        .from('productos')
        .select('stock, nombre')
        .eq('id', item.producto_id)
        .single()

      if (producto && producto.stock < item.cantidad) {
        return NextResponse.json({ error: `Stock insuficiente: ${item.nombre}` }, { status: 400 })
      }
    }

    // Validar cupón
    let descuento = data.descuento || 0
    if (data.cupon_codigo) {
      const { data: cupon } = await supabase
        .from('cupones')
        .select('*')
        .eq('codigo', data.cupon_codigo.toUpperCase())
        .eq('activo', true)
        .single()
      if (!cupon) return NextResponse.json({ error: 'Cupón inválido' }, { status: 400 })
      if (cupon.vence_en && new Date(cupon.vence_en) < new Date()) {
        return NextResponse.json({ error: 'Cupón vencido' }, { status: 400 })
      }
      if (cupon.usos_max && cupon.usos_actuales >= cupon.usos_max) {
        return NextResponse.json({ error: 'Cupón agotado' }, { status: 400 })
      }
      if (cupon.descuento_pct) descuento = data.subtotal * (cupon.descuento_pct / 100)
      if (cupon.descuento_fijo) descuento = cupon.descuento_fijo
    }

    // Crear pedido con datos de envío completos
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        cliente_nombre: data.cliente_nombre,
        cliente_email: data.cliente_email,
        cliente_telefono: data.cliente_telefono,
        provincia_envio: data.provincia_envio || null,
        ciudad_envio: data.ciudad_envio || null,
        direccion_envio: data.direccion_envio || null,
        codigo_postal: data.codigo_postal || null,
        costo_envio: data.costo_envio || 0,
        items: data.items,
        subtotal: data.subtotal,
        descuento,
        cupon_codigo: data.cupon_codigo || null,
        total: data.total - descuento,
        estado: 'pendiente',
        notas: data.notas,
      })
      .select()
      .single()

    if (pedidoError) throw new Error(`Error en base de datos: ${pedidoError.message}`)

    // Crear preferencia MercadoPago
    const preferencia = await crearPreferenciaPedido({
      id: pedido.id,
      numero: pedido.numero,
      items: data.items.map((i) => ({
        nombre: i.nombre,
        precio: i.precio,
        cantidad: i.cantidad,
      })),
      total: pedido.total,
      cliente: { nombre: data.cliente_nombre, email: data.cliente_email },
    })

    await supabase
      .from('pedidos')
      .update({ mp_preference_id: preferencia.id })
      .eq('id', pedido.id)

    if (data.cupon_codigo) {
      await supabase.rpc('incrementar_uso_cupon', { codigo: data.cupon_codigo.toUpperCase() })
    }

    return NextResponse.json({
      success: true,
      pedido_id: pedido.id,
      numero: pedido.numero,
      mp_url: preferencia.init_point,
    })
  } catch (error: any) {
    console.error('=== CHECKOUT ERROR ===', error)
    return NextResponse.json({ error: error.message || 'Error en checkout' }, { status: 500 })
  }
}
