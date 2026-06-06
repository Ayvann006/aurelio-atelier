import Nav from '@/components/ui/Nav'
import Footer from '@/components/ui/Footer'
import Link from 'next/link'
import { CheckCircle, ShoppingBag, MapPin, MessageCircle } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase'
import { formatPrecio, formatFecha } from '@/lib/utils'
import BotonesGracias from '@/components/tienda/BotonesGracias'

export const revalidate = 0
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: {
    pedido?: string
    estado?: string
  }
}

export default async function GraciasPage({ searchParams }: PageProps) {
  const nroPedido = searchParams.pedido
  const pendiente = searchParams.estado === 'pendiente'

  let pedido: any = null

  if (nroPedido) {
    try {
      const supabase = createServiceClient()
      const { data } = await supabase
        .from('pedidos')
        .select('*')
        .eq('numero', nroPedido)
        .single()
      pedido = data
    } catch (err) {
      console.error('Error cargando el pedido en la página de gracias:', err)
    }
  }

  return (
    <>
      <div className="print:hidden">
        <Nav />
      </div>
      <main className="min-h-screen pt-28 pb-20 px-4 md:px-8 bg-negro print:bg-white print:text-black print:pt-4 print:pb-4">
        <div className="max-w-3xl mx-auto">
          
          {/* Cabecera de Agradecimiento */}
          <div className="text-center mb-10 print:hidden">
            <div className="w-16 h-16 border border-dorado/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={28} className="text-dorado" strokeWidth={1} />
            </div>
            <h1 className="font-cormorant text-4xl md:text-5xl italic font-light mb-3">
              {pendiente ? '¡Pedido Recibido!' : '¡Gracias por tu compra!'}
            </h1>
            <p className="text-marfil/60 text-sm max-w-md mx-auto">
              {pendiente
                ? 'Tu pago está siendo procesado por Mercado Pago. Te notificaremos cuando se apruebe.'
                : 'Tu pago fue aprobado con éxito. Hemos registrado tu pedido en el atelier.'}
            </p>
            {nroPedido && (
              <p className="text-dorado text-sm tracking-widest uppercase mt-4">Pedido #{nroPedido}</p>
            )}
          </div>

          {pedido ? (
            <div className="space-y-6">
              
              {/* Comprobante de Compra */}
              <div className="bg-negro2 border border-marfil/5 p-6 md:p-8 space-y-6 print:border-none print:bg-white print:text-black print:p-0">
                
                {/* Cabecera del Comprobante */}
                <div className="flex justify-between items-start border-b border-marfil/5 print:border-black/10 pb-6">
                  <div>
                    <h2 className="font-cormorant text-2xl tracking-widest uppercase text-marfil print:text-black">Aurelio Martínez</h2>
                    <p className="text-dorado text-xs tracking-wider uppercase mt-1 print:text-black/60">Alta Costura · Atelier</p>
                    <p className="text-marfil/30 text-xs mt-2 print:text-black/50">El Salvador 5930, Palermo Hollywood, CABA</p>
                  </div>
                  <div className="text-right">
                    <p className="text-marfil/40 text-xs uppercase tracking-wider print:text-black/40">Fecha de compra</p>
                    <p className="text-sm mt-1">{pedido.created_at ? formatFecha(pedido.created_at.split('T')[0]) : '-'}</p>
                    <div className={`mt-3 inline-block text-[10px] px-2.5 py-1 tracking-wider uppercase ${pedido.estado === 'pagado' ? 'bg-green-500/10 text-green-400 border border-green-500/20 print:bg-transparent print:text-black print:border-black/30' : 'bg-dorado/10 text-dorado border border-dorado/20 print:bg-transparent print:text-black print:border-black/30'}`}>
                      {pedido.estado === 'pagado' ? 'Pagado' : 'Procesando'}
                    </div>
                  </div>
                </div>

                {/* Detalles de Cliente y Envío */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-marfil/5 print:border-black/10 pb-6">
                  <div className="space-y-2">
                    <p className="text-dorado text-xs tracking-widest uppercase mb-3 print:text-black/80 font-medium">Cliente</p>
                    <p className="text-sm font-light text-marfil/80 print:text-black"><span className="text-marfil/40 print:text-black/50">Nombre:</span> {pedido.cliente_nombre}</p>
                    <p className="text-sm font-light text-marfil/80 print:text-black"><span className="text-marfil/40 print:text-black/50">Email:</span> {pedido.cliente_email}</p>
                    {pedido.cliente_telefono && (
                      <p className="text-sm font-light text-marfil/80 print:text-black"><span className="text-marfil/40 print:text-black/50">Teléfono:</span> {pedido.cliente_telefono}</p>
                    )}
                  </div>

                  {pedido.direccion_envio && (
                    <div className="space-y-2">
                      <p className="text-dorado text-xs tracking-widest uppercase mb-3 print:text-black/80 font-medium">Envío</p>
                      <div className="flex gap-2 text-sm font-light text-marfil/80 print:text-black">
                        <MapPin size={14} className="text-dorado flex-shrink-0 mt-0.5 print:text-black" />
                        <div>
                          <p>{pedido.direccion_envio}</p>
                          <p className="text-marfil/40 text-xs mt-0.5 print:text-black/60">
                            {pedido.ciudad_envio}{pedido.provincia_envio ? `, ${pedido.provincia_envio}` : ''}
                            {pedido.codigo_postal ? ` (CP ${pedido.codigo_postal})` : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Detalle de Artículos */}
                <div>
                  <p className="text-dorado text-xs tracking-widest uppercase mb-4 print:text-black/80 font-medium">Detalle del Pedido</p>
                  <div className="space-y-4">
                    {Array.isArray(pedido.items) && pedido.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-sm border-b border-marfil/5 print:border-black/5 pb-3 last:border-none last:pb-0">
                        <div className="flex items-center gap-3">
                          <span className="text-marfil/30 print:text-black/50 text-xs">x{item.cantidad}</span>
                          <div>
                            <p className="font-light text-marfil print:text-black">{item.nombre}</p>
                            {item.variante && (
                              <p className="text-dorado text-xs uppercase tracking-wider mt-0.5 print:text-black/60">Variante: {item.variante}</p>
                            )}
                          </div>
                        </div>
                        <p className="font-cormorant text-lg text-marfil print:text-black">{formatPrecio(item.precio * item.cantidad)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resumen de Costos */}
                <div className="border-t border-marfil/5 print:border-black/10 pt-6 space-y-2.5 max-w-xs ml-auto">
                  <div className="flex justify-between text-sm text-marfil/80 print:text-black">
                    <span className="text-marfil/40 print:text-black/50">Subtotal</span>
                    <span>{formatPrecio(pedido.subtotal)}</span>
                  </div>
                  {pedido.descuento > 0 && (
                    <div className="flex justify-between text-sm text-dorado print:text-black">
                      <span>Descuento {pedido.cupon_codigo ? `(${pedido.cupon_codigo})` : ''}</span>
                      <span>-{formatPrecio(pedido.descuento)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-marfil/80 print:text-black">
                    <span className="text-marfil/40 print:text-black/50">Costo de Envío</span>
                    <span>{formatPrecio(pedido.costo_envio || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t border-marfil/10 print:border-black/20 pt-3 text-base text-marfil print:text-black">
                    <span className="font-medium">Total</span>
                    <span className="font-cormorant text-xl text-dorado print:text-black">{formatPrecio(pedido.total)}</span>
                  </div>
                </div>
              </div>

              {/* Botones Interactivos (Imprimir y WhatsApp) */}
              <BotonesGracias pedidoNumero={pedido.numero} />
            </div>
          ) : (
            <div className="text-center bg-negro2 border border-marfil/5 p-8 max-w-md mx-auto print:hidden">
              <ShoppingBag size={32} className="text-marfil/25 mx-auto mb-4" strokeWidth={1} />
              <p className="text-marfil/50 text-sm mb-6 leading-relaxed">
                No pudimos recuperar todos los detalles de tu compra automáticamente en este momento, pero no te preocupes: tu pedido está registrado y recibirás la confirmación de pago por correo electrónico.
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href={`https://wa.me/5491136205098${nroPedido ? `?text=Hola%20Aurelio%2C%20tengo%20una%20consulta%20sobre%20mi%20pedido%20%23${nroPedido}` : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold flex items-center justify-center gap-2 py-3 px-6 text-xs cursor-pointer"
                >
                  <MessageCircle size={14} /> Contactar Soporte
                </a>
                <Link href="/" className="btn-ghost py-3 px-6 text-xs">
                  Volver al inicio
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </>
  )
}
