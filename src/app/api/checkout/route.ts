import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { crearPreferenciaPedido } from '@/lib/mercadopago'
import { z } from 'zod'

const checkoutSchema = z.object({
  cliente_nombre: z.string().min(2),
  cliente_email: z.string().email(),
  cliente_telefono: z.string().min(8),
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
    console.log('Checkout body:', JSON.stringify(body, null, 2))

    const data = checkoutSchema.parse(body)
    const supabase = createServiceClient()

    // Verificar stock (si el producto no existe en Supabase, lo salteamos)
    for (const item of data.items) {
      const { data: producto, error: stockError } = await supabase
        .from('productos')
        .select('stock, nombre')
        .eq('id', item.producto_id)
        .single()

      console.log(`Stock check ${item.nombre}:`, producto, stockError?.message)

      if (producto && producto.stock < item.cantidad) {
        return NextResponse.json({ error: `Stock insuficiente: ${item.nombre}` }, { status: 400 })
      }
    }

    // Validar cupón si existe
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

    // Crear pedido en Supabase
    console.log('Creando pedido en Supabase...')
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        cliente_nombre: data.cliente_nombre,
        cliente_email: data.cliente_email,
        cliente_telefono: data.cliente_telefono,
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

    if (pedidoError) {
      console.error('Error Supabase al crear pedido:', pedidoError)
      throw new Error(`Error en base de datos: ${pedidoError.message}`)
    }

    console.log('Pedido creado:', pedido.id, pedido.numero)

    // Crear preferencia MercadoPago
    console.log('Creando preferencia MercadoPago...')
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

    console.log('Preferencia MP creada:', preferencia.id)

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
