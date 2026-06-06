'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ShoppingBag, Check, Eye } from 'lucide-react'
import { useCarrito } from '@/lib/store'
import { formatPrecio } from '@/lib/utils'
import { toast } from 'sonner'
import type { Producto } from '@/types'

export default function TarjetaProducto({ producto }: { producto: Producto }) {
  const [agregado, setAgregado] = useState(false)
  const [hoverImg, setHoverImg] = useState(false)
  const agregar = useCarrito((s) => s.agregar)

  function handleAgregar(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (producto.stock === 0) return
    agregar(producto)
    setAgregado(true)
    toast.success(`${producto.nombre} agregado al carrito`)
    setTimeout(() => setAgregado(false), 2000)
  }

  const img1 = producto.imagenes?.[0]
  const img2 = producto.imagenes?.[1]
  const sinStock = producto.stock === 0

  return (
    <div className="group relative">
      {/* Image container */}
      <Link href={`/tienda/${producto.slug}`} className="block">
        <div
          className="relative overflow-hidden bg-negro2"
          style={{ aspectRatio: '3/4' }}
          onMouseEnter={() => setHoverImg(true)}
          onMouseLeave={() => setHoverImg(false)}
        >
          {img1 ? (
            <>
              <img
                src={img1}
                alt={producto.nombre}
                className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ${hoverImg && img2 ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
              />
              {img2 && (
                <img
                  src={img2}
                  alt={producto.nombre}
                  className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ${hoverImg ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-negro3">
              <ShoppingBag size={32} className="text-marfil/8" strokeWidth={0.5} />
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-negro/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {producto.destacado && (
              <span className="bg-dorado/90 text-negro text-xs font-medium px-2.5 py-1 tracking-wider uppercase" style={{ fontSize: '10px' }}>
                Destacado
              </span>
            )}
            {producto.stock > 0 && producto.stock <= 3 && (
              <span className="bg-negro/80 text-marfil/80 text-xs px-2.5 py-1 backdrop-blur-sm" style={{ fontSize: '10px' }}>
                Últimas {producto.stock} unidades
              </span>
            )}
          </div>

          {/* Sin stock overlay */}
          {sinStock && (
            <div className="absolute inset-0 bg-negro/60 flex items-center justify-center backdrop-blur-[2px]">
              <span className="text-marfil/60 text-xs tracking-[0.2em] uppercase border border-marfil/20 px-4 py-2">Agotado</span>
            </div>
          )}

          {/* Quick actions on hover */}
          {!sinStock && (
            <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <button
                onClick={handleAgregar}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs tracking-wider transition-all backdrop-blur-sm ${
                  agregado
                    ? 'bg-dorado text-negro'
                    : 'bg-negro/80 text-marfil hover:bg-dorado hover:text-negro'
                }`}
              >
                {agregado ? <Check size={13} /> : <ShoppingBag size={13} strokeWidth={1.5} />}
                {agregado ? 'Agregado' : 'Agregar'}
              </button>
              <Link
                href={`/tienda/${producto.slug}`}
                onClick={e => e.stopPropagation()}
                className="flex items-center justify-center w-10 bg-negro/80 text-marfil hover:bg-marfil/10 transition-all backdrop-blur-sm"
              >
                <Eye size={14} strokeWidth={1.5} />
              </Link>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="pt-4 pb-2 px-1">
          <p className="text-dorado/60 tracking-[0.15em] uppercase mb-1" style={{ fontSize: '10px' }}>{producto.categoria}</p>
          <h3 className="font-cormorant text-lg font-light leading-tight mb-1.5 group-hover:text-dorado transition-colors duration-300">
            {producto.nombre}
          </h3>
          {producto.descripcion && (
            <p className="text-marfil/30 text-xs leading-relaxed line-clamp-1 mb-2">{producto.descripcion}</p>
          )}
          <p className="text-dorado font-cormorant text-lg">{formatPrecio(producto.precio)}</p>
        </div>
      </Link>
    </div>
  )
}
