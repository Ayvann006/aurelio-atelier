import { NextRequest } from 'next/server'
export function isAuthorized(req: NextRequest) {
  const token = req.headers.get('x-admin-token') || req.cookies.get('admin_auth')?.value
  return token === process.env.ADMIN_PASSWORD
}

// Para excepciones sensibles (ej: saltear la antelación mínima de 4hs) no alcanza
// con la cookie `admin_auth`, porque esa cookie viaja automáticamente en CUALQUIER
// pedido al sitio, incluso si Ivo tiene el admin abierto en una pestaña y prueba
// el sitio público de citas en otra pestaña del mismo navegador. Acá exigimos el
// header explícito, que solo lo manda el panel de admin a propósito.
export function esPedidoDelAdmin(req: NextRequest) {
  const token = req.headers.get('x-admin-token')
  return !!token && token === process.env.ADMIN_PASSWORD
}
