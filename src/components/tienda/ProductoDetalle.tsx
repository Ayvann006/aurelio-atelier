'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, ShoppingBag, Star, Check, ZoomIn, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useCarrito } from '@/lib/store'
import { formatPrecio } from '@/lib/utils'
import { toast } from 'sonner'
import type { Producto } from '@/types'

interface Review {
  id: string
  nombre: string
  estrellas: number
  comentario: string
  created_at: string
}

interface Props {
  producto: Producto
  relacionados: Producto[]
  reviews: Review[]
}

export default function ProductoDetalle({ producto, relacionados, reviews }: Props) {
  const fotos = [
    ...(producto.imagenes || []).length > 0 ? producto.imagenes : [],
  ].filter(Boolean)

  const [fotoIdx, setFotoIdx] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [agregado, setAgregado] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ nombre: '', email: '', estrellas: 5, comentario: '' })
  const [enviandoReview, setEnviandoReview] = useState(false)
  const agregar = useCarrito(s => s.agregar)

  function abrirLightbox(idx: number) {
    setLightboxIdx(idx)
    setLightbox(true)
    document.body.style.overflow = 'hidden'
  }

  function cerrarLightbox() {
    setLightbox(false)
    document.body.style.overflow = ''
  }

  function prevLightbox() { setLightboxIdx(i => (i - 1 + fotos.length) % fotos.length) }
  function nextLightbox() { setLightboxIdx(i => (i + 1) % fotos.length) }

  function handleAgregar() {
    agregar(producto)
    setAgregado(true)
    toast.success(`${producto.nombre} agregado al carrito`)
    setTimeout(() => setAgregado(false), 2500)
  }

  async function enviarReview(e: React.FormEvent) {
    e.preventDefault()
    setEnviandoReview(true)
    try {
      const res = await fetch(`/api/productos/${producto.slug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm),
      })
      if (res.ok) {
        toast.success('¡Gracias por tu reseña!')
        setShowReviewForm(false)
        setReviewForm({ nombre: '', email: '', estrellas: 5, comentario: '' })
      } else {
        toast.error('Error al enviar la reseña')
      }
    } finally { setEnviandoReview(false) }
  }

  const promedioEstrellas = reviews.length > 0
    ? Math.round(reviews.reduce((a, r) => a + r.estrellas, 0) / reviews.length * 10) / 10
    : 0

  return (
    <div className="px-6 md:px-14">
      <div className="max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-xs text-marfil/30">
          <Link href="/tienda" className="hover:text-dorado transition-colors flex items-center gap-1">
            <ArrowLeft size={12} /> Tienda
          </Link>
          <span>/</span>
          <span className="text-marfil/50">{producto.nombre}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

          {/* Galería */}
          <div className="space-y-3">
            {/* Foto principal */}
            <div className="relative overflow-hidden bg-negro2 group cursor-zoom-in" style={{aspectRatio:'3/4'}}
              onClick={() => abrirLightbox(fotoIdx)}>
              {fotos.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fotos[fotoIdx]} alt={producto.nombre}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag size={48} className="text-marfil/10" strokeWidth={0.5} />
                </div>
              )}
              {fotos.length > 0 && (
                <div className="absolute top-4 right-4 bg-negro/60 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn size={16} className="text-marfil/70" strokeWidth={1.5} />
                </div>
              )}
              {fotos.length > 1 && (
                <>
                  <button onClick={e => { e.stopPropagation(); setFotoIdx(i => (i-1+fotos.length)%fotos.length) }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-negro/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-negro/80">
                    <ChevronLeft size={16} className="text-marfil" strokeWidth={1.5} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setFotoIdx(i => (i+1)%fotos.length) }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-negro/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-negro/80">
                    <ChevronRight size={16} className="text-marfil" strokeWidth={1.5} />
                  </button>
                </>
              )}
            </div>

            {/* Miniaturas */}
            {fotos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {fotos.map((foto, idx) => (
                  <button key={idx} onClick={() => setFotoIdx(idx)}
                    className={`flex-shrink-0 w-16 h-20 overflow-hidden border-2 transition-all ${idx === fotoIdx ? 'border-dorado opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={foto} alt="" className="w-full h-full object-cover object-top" />
                  </button>
                ))}
              </div>
            )}

            {/* Dots para mobile */}
            {fotos.length > 1 && (
              <div className="flex justify-center gap-1.5 md:hidden">
                {fotos.map((_, i) => (
                  <button key={i} onClick={() => setFotoIdx(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === fotoIdx ? 'bg-dorado' : 'bg-marfil/20'}`} />
                ))}
              </div>
            )}
          </div>

          {/* Info del producto */}
          <div className="flex flex-col">
            <span className="text-dorado text-xs tracking-widest uppercase mb-2">{producto.categoria}</span>
            <h1 className="font-cormorant text-4xl italic font-light mb-4">{producto.nombre}</h1>

            {/* Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={14} className={s <= Math.round(promedioEstrellas) ? 'text-dorado fill-dorado' : 'text-marfil/20'} strokeWidth={1} />
                  ))}
                </div>
                <span className="text-marfil/40 text-sm">{promedioEstrellas} ({reviews.length} reseña{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            )}

            <div className="gold-line mb-6" />

            <p className="font-cormorant text-4xl font-light text-dorado mb-6">{formatPrecio(producto.precio)}</p>

            {producto.descripcion && (
              <p className="text-marfil/50 text-sm leading-relaxed mb-8">{producto.descripcion}</p>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2 mb-8">
              <div className={`w-2 h-2 rounded-full ${producto.stock > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm text-marfil/50">
                {producto.stock > 0 ? `${producto.stock} disponibles` : 'Sin stock'}
              </span>
            </div>

            {/* CTA */}
            <button onClick={handleAgregar} disabled={producto.stock === 0}
              className={`flex items-center justify-center gap-3 py-4 text-sm tracking-wider uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed ${agregado ? 'bg-dorado text-negro' : 'btn-gold-fill'}`}>
              {agregado ? <Check size={16} /> : <ShoppingBag size={16} strokeWidth={1.5} />}
              {agregado ? '¡Agregado al carrito!' : 'Agregar al carrito'}
            </button>

            <Link href="/citas" className="btn-ghost flex items-center justify-center gap-2 mt-3 py-3.5 text-xs">
              ¿Querés algo personalizado? Agendar cita
            </Link>

            {/* Info adicional */}
            <div className="mt-8 space-y-3 border-t border-marfil/8 pt-6">
              {[
                ['Envío', 'A todo el país — calculá el costo en el carrito'],
                ['Fabricación', '100% artesanal — bordado a mano'],
                ['Cambios', 'Consultá disponibilidad por WhatsApp'],
              ].map(([titulo, texto]) => (
                <div key={titulo} className="flex gap-3 text-sm">
                  <span className="text-dorado/60 flex-shrink-0 w-20 text-xs uppercase tracking-wider">{titulo}</span>
                  <span className="text-marfil/40">{texto}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reseñas */}
        <div className="border-t border-marfil/8 pt-12 mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-cormorant text-2xl italic">Reseñas</h2>
              {reviews.length > 0 && <p className="text-marfil/40 text-sm mt-1">{reviews.length} reseña{reviews.length !== 1 ? 's' : ''} · {promedioEstrellas} estrellas promedio</p>}
            </div>
            <button onClick={() => setShowReviewForm(!showReviewForm)}
              className="btn-ghost text-xs py-2.5 px-5">
              Dejar una reseña
            </button>
          </div>

          {showReviewForm && (
            <form onSubmit={enviarReview} className="card-dark mb-8 border border-dorado/15">
              <p className="text-xs text-dorado tracking-widest uppercase mb-5">Tu reseña</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Nombre *</label>
                  <input value={reviewForm.nombre} onChange={e => setReviewForm(r=>({...r,nombre:e.target.value}))} required className="input-dark w-full" /></div>
                <div><label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Email *</label>
                  <input type="email" value={reviewForm.email} onChange={e => setReviewForm(r=>({...r,email:e.target.value}))} required className="input-dark w-full" /></div>
              </div>
              <div className="mb-4">
                <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Calificación</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setReviewForm(r=>({...r,estrellas:s}))}
                      className="transition-all">
                      <Star size={20} className={s <= reviewForm.estrellas ? 'text-dorado fill-dorado' : 'text-marfil/20'} strokeWidth={1} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-5"><label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Comentario *</label>
                <textarea value={reviewForm.comentario} onChange={e => setReviewForm(r=>({...r,comentario:e.target.value}))} required rows={3} className="input-dark w-full resize-none" placeholder="Contanos tu experiencia con el producto..." /></div>
              <div className="flex gap-3">
                <button type="submit" disabled={enviandoReview} className="btn-gold-fill flex-1 justify-center py-2.5 text-xs">Enviar reseña</button>
                <button type="button" onClick={() => setShowReviewForm(false)} className="btn-ghost flex-1 justify-center py-2.5 text-xs">Cancelar</button>
              </div>
            </form>
          )}

          {reviews.length === 0 ? (
            <p className="text-marfil/25 text-sm text-center py-8">Sé el primero en dejar una reseña</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px">
              {reviews.map(r => (
                <div key={r.id} className="card-dark">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium text-sm">{r.nombre}</p>
                    <p className="text-marfil/30 text-xs">{new Date(r.created_at).toLocaleDateString('es-AR')}</p>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= r.estrellas ? 'text-dorado fill-dorado' : 'text-marfil/15'} strokeWidth={1} />)}
                  </div>
                  <p className="text-marfil/60 text-sm leading-relaxed">{r.comentario}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Productos relacionados */}
        {relacionados.length > 0 && (
          <div className="border-t border-marfil/8 pt-12">
            <h2 className="font-cormorant text-2xl italic mb-8">También te puede interesar</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px">
              {relacionados.map(p => (
                <Link key={p.id} href={`/tienda/${p.slug}`} className="bg-negro2 group overflow-hidden">
                  <div className="relative overflow-hidden" style={{aspectRatio:'3/4'}}>
                    {p.imagenes?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imagenes[0]} alt={p.nombre}
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                        style={{filter:'brightness(0.7)'}} />
                    ) : (
                      <div className="w-full h-full bg-negro3 flex items-center justify-center">
                        <ShoppingBag size={32} className="text-marfil/10" strokeWidth={0.5} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-dorado text-xs uppercase tracking-wider mb-1">{p.categoria}</p>
                    <p className="font-cormorant text-lg font-light">{p.nombre}</p>
                    <p className="text-dorado text-sm mt-1">{formatPrecio(p.precio)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox fullscreen */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{background: 'rgba(42, 42, 42, 0.3)', backdropFilter: 'blur(20px)'}} onClick={cerrarLightbox}>
          <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <p className="font-cormorant text-lg italic text-marfil">{producto.nombre}</p>
            <div className="flex items-center gap-4">
              <p className="text-marfil/30 text-xs">{lightboxIdx + 1} / {fotos.length}</p>
              <button onClick={cerrarLightbox} className="text-marfil/40 hover:text-marfil transition-colors"><X size={20} strokeWidth={1} /></button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center px-4 relative" onClick={e => e.stopPropagation()}>
            {fotos.length > 1 && (
              <button onClick={prevLightbox} className="absolute left-4 z-10 w-10 h-10 border border-marfil/20 flex items-center justify-center text-marfil/50 hover:text-dorado hover:border-dorado/40 transition-all">
                <ChevronLeft size={18} strokeWidth={1.5} />
              </button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fotos[lightboxIdx]} alt={producto.nombre}
              className="max-h-[75vh] max-w-full object-contain" style={{userSelect:'none'}} />
            {fotos.length > 1 && (
              <button onClick={nextLightbox} className="absolute right-4 z-10 w-10 h-10 border border-marfil/20 flex items-center justify-center text-marfil/50 hover:text-dorado hover:border-dorado/40 transition-all">
                <ChevronRight size={18} strokeWidth={1.5} />
              </button>
            )}
          </div>

          {fotos.length > 1 && (
            <div className="flex-shrink-0 flex gap-2 justify-center px-6 py-4" onClick={e => e.stopPropagation()}>
              {fotos.map((foto, idx) => (
                <button key={idx} onClick={() => setLightboxIdx(idx)}
                  className={`flex-shrink-0 overflow-hidden border-2 transition-all ${idx === lightboxIdx ? 'border-dorado opacity-100' : 'border-transparent opacity-35 hover:opacity-60'}`}
                  style={{width:'56px', height:'72px'}}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={foto} alt="" className="w-full h-full object-cover object-top" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
