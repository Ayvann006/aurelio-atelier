'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ShoppingBag, Check } from 'lucide-react'
import { useCarrito } from '@/lib/store'
import { formatPrecio } from '@/lib/utils'
import { toast } from 'sonner'
import type { Producto } from '@/types'

export default function TarjetaProducto({ producto }: { producto: Producto }) {
  const [agregado, setAgregado] = useState(false)
  const agregar = useCarrito((s) => s.agregar)

  function handleAgregar() {
    agregar(producto)
    setAgregado(true)
    toast.success(`${producto.nombre} agregado al carrito`)
    setTimeout(() => setAgregado(false), 2000)
  }

  const img = producto.imagenes?.[0]

  return (
    <div className="bg-negro2 group overflow-hidden">
      <div className="relative overflow-hidden bg-negro3" style={{aspectRatio:'3/4'}}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={producto.nombre}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
            style={{ filter: 'brightness(0.75)' }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-marfil/10">
            <ShoppingBag size={40} strokeWidth={0.5} />
          </div>
        )}
        {producto.destacado && (
          <div className="absolute top-3 left-3 bg-negro border border-dorado/50 text-dorado text-xs px-3 py-1 tracking-wider">
            Destacado
          </div>
        )}
        {producto.stock <= 3 && producto.stock > 0 && (
          <div className="absolute top-3 right-3 bg-negro/80 text-marfil/60 text-xs px-2 py-1">
            Solo {producto.stock}
          </div>
        )}
        {producto.stock === 0 && (
          <div className="absolute inset-0 bg-negro/60 flex items-center justify-center">
            <span className="text-marfil/50 text-xs tracking-widest uppercase">Sin stock</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <p className="text-dorado text-xs tracking-widest uppercase mb-1">{producto.categoria}</p>
        <Link href={`/tienda/${producto.slug}`} className="font-cormorant text-lg font-light mb-1 hover:text-dorado transition-colors block">{producto.nombre}</Link>
        {producto.descripcion && (
          <p className="text-marfil/35 text-xs leading-relaxed mb-3 line-clamp-2">{producto.descripcion}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-dorado text-sm">{formatPrecio(producto.precio)}</span>
          <button
            onClick={handleAgregar}
            disabled={producto.stock === 0}
            className={`flex items-center gap-1.5 text-xs px-4 py-2 border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${agregado ? 'border-dorado bg-dorado/15 text-dorado' : 'border-marfil/15 text-marfil/50 hover:border-dorado/50 hover:text-dorado'}`}
          >
            {agregado ? <Check size={12} /> : <ShoppingBag size={12} strokeWidth={1.5} />}
            {agregado ? 'Agregado' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}
