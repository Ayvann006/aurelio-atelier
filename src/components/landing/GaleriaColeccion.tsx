'use client'
import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import Link from 'next/link'

interface Vestido {
  id: string
  nombre: string
  descripcion: string
  imagen_principal: string
  imagenes: string[]
  categoria: string
  año: number
  destacado: boolean
}

export default function GaleriaColeccion({ vestidos, categoria }: { vestidos: Vestido[], categoria: string }) {
  const [seleccionado, setSeleccionado] = useState<Vestido | null>(null)
  const [fotoIdx, setFotoIdx] = useState(0)

  function abrirLightbox(v: Vestido, idx = 0) {
    setSeleccionado(v)
    setFotoIdx(idx)
    document.body.style.overflow = 'hidden'
  }

  function cerrar() {
    setSeleccionado(null)
    setFotoIdx(0)
    document.body.style.overflow = ''
  }

  function getFotos(v: Vestido) {
    // imagen_principal first, then additional imagenes (deduped)
    const todas = [v.imagen_principal, ...(v.imagenes || [])].filter(Boolean)
    return Array.from(new Set(todas))
  }

  function prev() {
    if (!seleccionado) return
    const fotos = getFotos(seleccionado)
    setFotoIdx(i => (i - 1 + fotos.length) % fotos.length)
  }

  function next() {
    if (!seleccionado) return
    const fotos = getFotos(seleccionado)
    setFotoIdx(i => (i + 1) % fotos.length)
  }

  // Keyboard navigation
  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') cerrar()
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
  }

  if (vestidos.length === 0) {
    return (
      <div className="text-center py-24 px-6">
        <p className="font-cormorant text-3xl italic text-marfil/20 mb-4">Colección en preparación</p>
        <p className="text-marfil/30 text-sm mb-8">Próximamente compartiremos los diseños de esta colección.</p>
        <Link href="/citas" className="btn-gold">Agendar una cita</Link>
      </div>
    )
  }

  return (
    <>
      <div className="px-6 md:px-14">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px">
            {vestidos.map((v, i) => {
              const fotos = getFotos(v)
              const grande = i % 7 === 0 || i % 7 === 4
              return (
                <div
                  key={v.id}
                  className={`relative overflow-hidden group cursor-pointer ${grande ? 'sm:col-span-2 lg:col-span-2' : ''}`}
                  style={{ aspectRatio: grande ? '16/9' : '2/3' }}
                  onClick={() => abrirLightbox(v)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={v.imagen_principal}
                    alt={v.nombre}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    style={{ filter: 'brightness(0.6)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-negro/90 via-transparent to-transparent" />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-negro/40 backdrop-blur-sm px-4 py-2 flex items-center gap-2">
                      <ZoomIn size={14} className="text-dorado" strokeWidth={1.5} />
                      <span className="text-marfil text-xs tracking-wider">Ver diseño</span>
                      {fotos.length > 1 && (
                        <span className="text-dorado/70 text-xs">· {fotos.length} fotos</span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-dorado text-xs tracking-widest uppercase mb-1">{v.año || '2025'}</p>
                    <p className="font-cormorant text-xl italic text-marfil">{v.nombre}</p>
                    {v.descripcion && (
                      <p className="text-marfil/50 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">{v.descripcion}</p>
                    )}
                  </div>

                  {/* Miniatura de fotos adicionales */}
                  {fotos.length > 1 && (
                    <div className="absolute bottom-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {fotos.slice(0, 4).map((_, idx) => (
                        <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-dorado' : 'bg-marfil/40'}`} />
                      ))}
                    </div>
                  )}

                  {v.destacado && (
                    <div className="absolute top-4 left-4 bg-negro/80 border border-dorado/50 text-dorado text-xs px-3 py-1 tracking-wider">
                      Destacado
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-16 py-12 border-t border-marfil/8">
            <p className="font-cormorant text-2xl italic text-marfil/60 mb-2">¿Te enamoraste de algún diseño?</p>
            <p className="text-marfil/30 text-sm mb-6">Todos los vestidos son únicos y adaptables a tu medida.</p>
            <Link href="/citas" className="btn-gold">Agendar cita con Aurelio</Link>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {seleccionado && (() => {
        const fotos = getFotos(seleccionado)
        return (
          <div
            className="fixed inset-0 z-50 flex flex-col" style={{background: 'rgba(42, 42, 42, 0.3)', backdropFilter: 'blur(20px)'}}
            onKeyDown={handleKey}
            tabIndex={0}
            onClick={cerrar}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
              <div>
                <p className="text-dorado text-xs tracking-widest uppercase mb-0.5">{seleccionado.año}</p>
                <p className="font-cormorant text-xl italic text-marfil">{seleccionado.nombre}</p>
              </div>
              <div className="flex items-center gap-4">
                {fotos.length > 1 && (
                  <p className="text-marfil/30 text-xs">{fotoIdx + 1} / {fotos.length}</p>
                )}
                <button onClick={cerrar} className="text-marfil/40 hover:text-marfil transition-colors">
                  <X size={22} strokeWidth={1} />
                </button>
              </div>
            </div>

            {/* Main image */}
            <div className="flex-1 flex items-center justify-center px-4 relative" onClick={e => e.stopPropagation()}>
              {fotos.length > 1 && (
                <button onClick={prev}
                  className="absolute left-4 z-10 w-10 h-10 border border-marfil/20 flex items-center justify-center text-marfil/50 hover:text-dorado hover:border-dorado/40 transition-all">
                  <ChevronLeft size={18} strokeWidth={1.5} />
                </button>
              )}

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fotos[fotoIdx]}
                alt={`${seleccionado.nombre} — foto ${fotoIdx + 1}`}
                className="max-h-[65vh] max-w-full object-contain"
                style={{ userSelect: 'none' }}
              />

              {fotos.length > 1 && (
                <button onClick={next}
                  className="absolute right-4 z-10 w-10 h-10 border border-marfil/20 flex items-center justify-center text-marfil/50 hover:text-dorado hover:border-dorado/40 transition-all">
                  <ChevronRight size={18} strokeWidth={1.5} />
                </button>
              )}
            </div>

            {/* Thumbnails */}
            {fotos.length > 1 && (
              <div className="flex-shrink-0 px-6 py-4" onClick={e => e.stopPropagation()}>
                <div className="flex gap-2 justify-center overflow-x-auto">
                  {fotos.map((foto, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFotoIdx(idx)}
                      className={`flex-shrink-0 w-14 h-18 border-2 transition-all overflow-hidden ${idx === fotoIdx ? 'border-dorado opacity-100' : 'border-transparent opacity-40 hover:opacity-70'}`}
                      style={{ height: '72px' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={foto} alt="" className="w-full h-full object-cover object-top" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {seleccionado.descripcion && (
              <div className="flex-shrink-0 text-center pb-4" onClick={e => e.stopPropagation()}>
                <p className="text-marfil/40 text-sm italic">{seleccionado.descripcion}</p>
              </div>
            )}
          </div>
        )
      })()}
    </>
  )
}
