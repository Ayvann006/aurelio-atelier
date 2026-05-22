import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ItemCarrito, Producto } from '@/types'

interface CarritoStore {
  items: ItemCarrito[]
  agregar: (producto: Producto, variante?: string) => void
  quitar: (productoId: string, variante?: string) => void
  actualizar: (productoId: string, cantidad: number, variante?: string) => void
  limpiar: () => void
  total: () => number
  cantidad: () => number
}

export const useCarrito = create<CarritoStore>()(
  persist(
    (set, get) => ({
      items: [],
      agregar: (producto, variante) => {
        set((state) => {
          const key = variante ? `${producto.id}-${variante}` : producto.id
          const existente = state.items.find(
            (i) => (variante ? `${i.producto.id}-${i.variante}` : i.producto.id) === key
          )
          if (existente) {
            return {
              items: state.items.map((i) =>
                (variante ? `${i.producto.id}-${i.variante}` : i.producto.id) === key
                  ? { ...i, cantidad: i.cantidad + 1 }
                  : i
              ),
            }
          }
          return { items: [...state.items, { producto, cantidad: 1, variante }] }
        })
      },
      quitar: (productoId, variante) => {
        set((state) => ({
          items: state.items.filter((i) =>
            variante
              ? !(i.producto.id === productoId && i.variante === variante)
              : i.producto.id !== productoId
          ),
        }))
      },
      actualizar: (productoId, cantidad, variante) => {
        if (cantidad <= 0) { get().quitar(productoId, variante); return }
        set((state) => ({
          items: state.items.map((i) =>
            i.producto.id === productoId && i.variante === variante
              ? { ...i, cantidad }
              : i
          ),
        }))
      },
      limpiar: () => set({ items: [] }),
      total: () => get().items.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0),
      cantidad: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    { name: 'aurelio-carrito' }
  )
)
