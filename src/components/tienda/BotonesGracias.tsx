'use client'
import { Printer, MessageCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface BotonesGraciasProps {
  pedidoNumero: string
}

export default function BotonesGracias({ pedidoNumero }: BotonesGraciasProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 print:hidden">
      <button
        onClick={() => window.print()}
        className="btn-ghost flex items-center justify-center gap-2 py-3 px-6 text-xs cursor-pointer"
      >
        <Printer size={13} /> Imprimir Comprobante
      </button>
      <a
        href={`https://wa.me/5491136205098?text=Hola%20Aurelio%2C%20acabo%20de%20realizar%20la%20compra%20con%20n%C3%BAmero%20de%20pedido%20%23${pedidoNumero}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-gold flex items-center justify-center gap-2 py-3 px-6 text-xs cursor-pointer"
      >
        <MessageCircle size={13} /> Avisar por WhatsApp
      </a>
      <Link href="/tienda" className="btn-ghost flex items-center justify-center gap-2 py-3 px-6 text-xs">
        <ArrowLeft size={13} /> Seguir Comprando
      </Link>
    </div>
  )
}
