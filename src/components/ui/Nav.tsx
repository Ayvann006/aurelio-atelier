'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCarrito } from '@/lib/store'
import { ShoppingBag, Menu, X } from 'lucide-react'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [montado, setMontado] = useState(false)
  const cantidad = useCarrito((s) => s.cantidad())

  useEffect(() => {
    setMontado(true)
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-14 transition-all duration-300 ${scrolled ? 'py-4 bg-negro/95 backdrop-blur-md border-b border-dorado/15' : 'py-6 bg-negro/80 backdrop-blur-sm border-b border-dorado/8'}`}>
        <Link href="/" className="font-cormorant text-lg tracking-[0.3em] uppercase text-marfil">
          Aurelio Martínez
        </Link>
        <ul className="hidden md:flex items-center gap-10 list-none">
          {[
            ['Novias', '/colecciones/novias'],
            ['Quinceañeras', '/colecciones/quinceaneras'],
            ['Gala', '/colecciones/gala'],
            ['Miss', '/colecciones/miss'],
            ['Tienda', '/tienda'],
            ['Contacto', '/#contacto'],
          ].map(([label, href]) => (
            <li key={label}>
              <Link href={href} className="text-marfil/55 text-xs tracking-widest uppercase hover:text-dorado transition-colors">
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-4">
          <Link href="/tienda/carrito" className="relative text-marfil/60 hover:text-dorado transition-colors">
            <ShoppingBag size={20} strokeWidth={1.5} />
            {montado && cantidad > 0 && (
              <span className="absolute -top-2 -right-2 bg-dorado text-negro w-4 h-4 flex items-center justify-center font-medium" style={{ fontSize: '10px' }}>
                {cantidad}
              </span>
            )}
          </Link>
          <Link href="/citas" className="hidden md:block btn-gold text-xs py-2 px-5">
            Agendar Cita
          </Link>
          <button onClick={() => setOpen(true)} className="md:hidden text-marfil/60 hover:text-marfil">
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-50 bg-negro/97 flex flex-col items-center justify-center gap-8 transition-all duration-300 ${open ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <button onClick={() => setOpen(false)} className="absolute top-6 right-8 text-marfil/50 hover:text-marfil">
          <X size={24} strokeWidth={1} />
        </button>
        {[
          ['Novias', '/colecciones/novias'],
          ['Quinceañeras', '/colecciones/quinceaneras'],
          ['Gala', '/colecciones/gala'],
          ['Miss', '/colecciones/miss'],
          ['Tienda', '/tienda'],
          ['Contacto', '/#contacto'],
        ].map(([label, href]) => (
          <Link key={label} href={href} onClick={() => setOpen(false)}
            className="font-cormorant text-3xl italic font-light text-marfil hover:text-dorado transition-colors">
            {label}
          </Link>
        ))}
        <Link href="/citas" onClick={() => setOpen(false)} className="btn-gold mt-4">
          Agendar Cita
        </Link>
      </div>
    </>
  )
}
