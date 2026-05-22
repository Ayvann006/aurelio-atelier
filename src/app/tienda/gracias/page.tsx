import Nav from '@/components/ui/Nav'
import Footer from '@/components/ui/Footer'
import Link from 'next/link'
import { CheckCircle, MessageCircle } from 'lucide-react'

export default function GraciasPage({ searchParams }: { searchParams: { pedido?: string; estado?: string } }) {
  const pendiente = searchParams.estado === 'pendiente'
  return (
    <>
      <Nav />
      <main className="min-h-screen pt-28 pb-20 px-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 border border-dorado/30 flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={28} className="text-dorado" strokeWidth={1} />
          </div>
          <h1 className="font-cormorant text-3xl italic mb-3">
            {pendiente ? '¡Pedido Recibido!' : '¡Gracias por tu compra!'}
          </h1>
          <p className="text-marfil/50 text-sm mb-2">
            {pendiente ? 'Tu pago está siendo procesado.' : 'Tu pago fue aprobado.'}
          </p>
          {searchParams.pedido && (
            <p className="text-dorado text-xs tracking-wider mb-8">Pedido #{searchParams.pedido}</p>
          )}
          <p className="text-marfil/40 text-sm mb-8">
            Recibirás un email de confirmación con los detalles de tu pedido. Desde el atelier nos pondremos en contacto a la brevedad.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://wa.me/5491136205098" className="btn-gold flex items-center justify-center gap-2">
              <MessageCircle size={14} /> Contactar
            </a>
            <Link href="/" className="btn-ghost flex items-center justify-center">
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
