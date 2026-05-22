import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-negro flex items-center justify-center px-6">
      <div className="text-center">
        <p className="font-cormorant text-[120px] font-light text-dorado/15 leading-none mb-4">404</p>
        <h1 className="font-cormorant text-3xl italic font-light text-marfil mb-3">
          Esta página no existe
        </h1>
        <div className="w-10 h-px bg-dorado mx-auto mb-6" />
        <p className="text-marfil/40 text-sm mb-8">
          La página que buscás no fue encontrada o fue movida.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/" className="btn-gold text-xs">Volver al inicio</Link>
          <Link href="/citas" className="btn-ghost text-xs">Agendar cita</Link>
        </div>
      </div>
    </div>
  )
}
