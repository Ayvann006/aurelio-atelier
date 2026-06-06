'use client'
import { useState, useMemo } from 'react'
import type { Producto } from '@/types'
import TarjetaProducto from './TarjetaProducto'
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react'

interface Props {
  productos: Producto[]
  categorias?: string[]
}

export default function CatalogoProductos({ productos, categorias: catsProp }: Props) {
  const [catSel, setCatSel] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState<'relevante' | 'precio-asc' | 'precio-desc' | 'nombre'>('relevante')
  const [showOrden, setShowOrden] = useState(false)

  // Build categories dynamically from products
  const categoriasUnicas = useMemo(() => {
    const cats = catsProp || Array.from(new Set(productos.map(p => p.categoria).filter(Boolean)))
    return [{ value: 'todos', label: 'Todos', count: productos.length }, ...cats.map(c => ({
      value: c,
      label: c.charAt(0).toUpperCase() + c.slice(1),
      count: productos.filter(p => p.categoria === c).length,
    }))]
  }, [productos, catsProp])

  const filtrados = useMemo(() => {
    let result = catSel === 'todos' ? productos : productos.filter(p => p.categoria === catSel)

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      result = result.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion?.toLowerCase().includes(q) ||
        p.categoria?.toLowerCase().includes(q)
      )
    }

    switch (orden) {
      case 'precio-asc': return [...result].sort((a, b) => a.precio - b.precio)
      case 'precio-desc': return [...result].sort((a, b) => b.precio - a.precio)
      case 'nombre': return [...result].sort((a, b) => a.nombre.localeCompare(b.nombre))
      default: return [...result].sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0))
    }
  }, [productos, catSel, busqueda, orden])

  const ORDEN_LABELS: Record<string, string> = {
    'relevante': 'Destacados',
    'precio-asc': 'Menor precio',
    'precio-desc': 'Mayor precio',
    'nombre': 'A - Z',
  }

  return (
    <div>
      {/* Toolbar: Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-marfil/25" />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full bg-negro2 border border-marfil/8 text-marfil text-sm pl-10 pr-4 py-2.5 focus:outline-none focus:border-dorado/30 placeholder:text-marfil/20 transition-colors"
          />
        </div>
        <div className="relative">
          <button onClick={() => setShowOrden(!showOrden)}
            className="flex items-center gap-2 border border-marfil/8 px-4 py-2.5 text-xs text-marfil/50 hover:border-dorado/30 hover:text-dorado transition-all">
            <SlidersHorizontal size={13} />
            {ORDEN_LABELS[orden]}
            <ChevronDown size={12} className={`transition-transform ${showOrden ? 'rotate-180' : ''}`} />
          </button>
          {showOrden && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowOrden(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 bg-negro2 border border-marfil/10 min-w-[160px]">
                {Object.entries(ORDEN_LABELS).map(([key, label]) => (
                  <button key={key} onClick={() => { setOrden(key as any); setShowOrden(false) }}
                    className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${orden === key ? 'text-dorado bg-dorado/5' : 'text-marfil/50 hover:text-marfil hover:bg-marfil/3'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {categoriasUnicas.map(c => (
          <button
            key={c.value}
            onClick={() => setCatSel(c.value)}
            className={`px-4 py-2 text-xs tracking-widest uppercase border transition-all flex items-center gap-2 ${
              catSel === c.value
                ? 'border-dorado bg-dorado/10 text-dorado'
                : 'border-marfil/8 text-marfil/35 hover:border-dorado/25 hover:text-dorado'
            }`}
          >
            {c.label}
            <span className={`text-xs ${catSel === c.value ? 'text-dorado/60' : 'text-marfil/20'}`}>{c.count}</span>
          </button>
        ))}
      </div>

      {/* Results count */}
      {busqueda && (
        <p className="text-marfil/30 text-xs mb-4">
          {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''} para "{busqueda}"
          {catSel !== 'todos' && ` en ${catSel}`}
        </p>
      )}

      {/* Products grid */}
      {filtrados.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-cormorant text-2xl italic text-marfil/25 mb-2">
            {busqueda ? 'Sin resultados' : 'No hay productos en esta categoría'}
          </p>
          <p className="text-marfil/20 text-sm">
            {busqueda ? 'Probá con otro término de búsqueda' : 'Pronto agregaremos novedades'}
          </p>
          {(busqueda || catSel !== 'todos') && (
            <button onClick={() => { setBusqueda(''); setCatSel('todos') }}
              className="mt-4 text-dorado text-xs border border-dorado/30 px-4 py-2 hover:bg-dorado/10 transition-all">
              Ver todos los productos
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtrados.map(p => <TarjetaProducto key={p.id} producto={p} />)}
        </div>
      )}
    </div>
  )
}
