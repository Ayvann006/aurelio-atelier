'use client'
import { useState } from 'react'
import type { Producto } from '@/types'
import TarjetaProducto from './TarjetaProducto'

const CATS = [
  { value: 'todos', label: 'Todos' },
  { value: 'batas', label: 'Batas' },
  { value: 'tiaras', label: 'Tiaras' },
  { value: 'tocados', label: 'Tocados' },
  { value: 'accesorios', label: 'Accesorios' },
]

export default function CatalogoProductos({ productos }: { productos: Producto[] }) {
  const [catSel, setCatSel] = useState('todos')
  const filtrados = catSel === 'todos' ? productos : productos.filter((p) => p.categoria === catSel)

  return (
    <div>
      {/* Filtros */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {CATS.map((c) => (
          <button
            key={c.value}
            onClick={() => setCatSel(c.value)}
            className={`px-5 py-2 text-xs tracking-widest uppercase border transition-all ${catSel === c.value ? 'border-dorado bg-dorado/10 text-dorado' : 'border-marfil/10 text-marfil/40 hover:border-dorado/30 hover:text-dorado'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center py-20 text-marfil/30">
          <p className="font-cormorant text-2xl italic">No hay productos en esta categoría</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px">
          {filtrados.map((p) => <TarjetaProducto key={p.id} producto={p} />)}
        </div>
      )}
    </div>
  )
}
