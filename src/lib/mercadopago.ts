import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

export function getMPClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  })
}

function getAppUrl() {
  return process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

function isLocalhost(url: string) {
  return url.includes('localhost') || url.includes('127.0.0.1')
}

export async function crearPreferenciaPedido(pedido: {
  id: string
  numero: string
  items: { nombre: string; precio: number; cantidad: number }[]
  total: number
  cliente: { nombre: string; email: string }
}) {
  const client = getMPClient()
  const preference = new Preference(client)
  const appUrl = getAppUrl()
  const esLocal = isLocalhost(appUrl)

  const result = await preference.create({
    body: {
      items: pedido.items.map((item) => ({
        id: item.nombre,
        title: item.nombre,
        quantity: item.cantidad,
        unit_price: item.precio,
        currency_id: 'ARS',
      })),
      payer: {
        name: pedido.cliente.nombre,
        email: pedido.cliente.email,
      },
      back_urls: {
        success: `${appUrl}/tienda/gracias?pedido=${pedido.numero}`,
        failure: `${appUrl}/tienda/carrito?error=pago`,
        pending: `${appUrl}/tienda/gracias?pedido=${pedido.numero}&estado=pendiente`,
      },
      ...(esLocal ? {} : { auto_return: 'approved' as const }),
      external_reference: pedido.id,
      ...(esLocal ? {} : { notification_url: `${appUrl}/api/webhook/mp` }),
      statement_descriptor: 'AURELIO MARTINEZ',
    },
  })

  return result
}

export async function crearPreferenciaCita(cita: {
  id: string
  cliente: { nombre: string; email: string }
  fecha: string
  hora: string
  monto: number
}) {
  const client = getMPClient()
  const preference = new Preference(client)
  const appUrl = getAppUrl()
  const esLocal = isLocalhost(appUrl)

  const result = await preference.create({
    body: {
      items: [
        {
          id: `cita-${cita.id}`,
          title: `Seña — Cita Atelier Aurelio Martínez`,
          description: `${cita.fecha} a las ${cita.hora} hs`,
          quantity: 1,
          unit_price: cita.monto,
          currency_id: 'ARS',
        },
      ],
      payer: {
        name: cita.cliente.nombre,
        email: cita.cliente.email,
      },
      back_urls: {
        success: `${appUrl}/citas/confirmada?id=${cita.id}`,
        failure: `${appUrl}/citas?error=pago`,
        pending: `${appUrl}/citas/confirmada?id=${cita.id}&estado=pendiente`,
      },
      ...(esLocal ? {} : { auto_return: 'approved' as const }),
      external_reference: `cita-${cita.id}`,
      ...(esLocal ? {} : { notification_url: `${appUrl}/api/webhook/mp` }),
      statement_descriptor: 'AURELIO MARTINEZ',
    },
  })

  return result
}

export async function obtenerPago(paymentId: string) {
  const client = getMPClient()
  const payment = new Payment(client)
  return await payment.get({ id: paymentId })
}
