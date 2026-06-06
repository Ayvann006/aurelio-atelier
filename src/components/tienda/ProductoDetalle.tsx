'use client'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, ShoppingBag, Star, Check, ZoomIn, ArrowLeft, Shield, Truck, Sparkles, MessageCircle, Heart } from 'lucide-react'
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
  const fotos = [...(producto.imagenes || [])].filter(Boolean)
  const [fotoIdx, setFotoIdx] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [agregado, setAgregado] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ nombre: '', email: '', estrellas: 5, comentario: '' })
  const [enviandoReview, setEnviandoReview] = useState(false)
  const [showSticky, setShowSticky] = useState(false)
  const agregar = useCarrito(s => s.agregar)

  useEffect(() => {
    const handleScroll = () => setShowSticky(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
    if (producto.stock === 0) return
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
      } else toast.error('Error al enviar la reseña')
    } finally { setEnviandoReview(false) }
  }

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightbox) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrarLightbox()
      if (e.key === 'ArrowLeft') prevLightbox()
      if (e.key === 'ArrowRight') nextLightbox()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightbox])

  const promedioEstrellas = reviews.length > 0
    ? Math.round(reviews.reduce((a, r) => a + r.estrellas, 0) / reviews.length * 10) / 10
    : 0

  const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || '5491136205098'

  return (
    <div className="px-6 md:px-14">
      <div className="max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-xs text-marfil/30">
          <Link href="/tienda" className="hover:text-dorado transition-colors flex items-center gap-1">
            <ArrowLeft size={12} /> Tienda
          </Link>
          <span>/</span>
          <span className="text-dorado/50 capitalize">{producto.categoria}</span>
          <span>/</span>
          <span className="text-marfil/50">{producto.nombre}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 mb-20">

          {/* Galería */}
          <div className="space-y-3">
            <div className="relative overflow-hidden bg-negro2 group cursor-zoom-in" style={{ aspectRatio: '3/4' }}
              onClick={() => fotos.length > 0 && abrirLightbox(fotoIdx)}>
              {fotos.length > 0 ? (
                <img src={fotos[fotoIdx]} alt={producto.nombre}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-negro3">
                  <ShoppingBag size={48} className="text-marfil/8" strokeWidth={0.5} />
                </div>
              )}
              {fotos.length > 0 && (
                <div className="absolute top-4 right-4 bg-negro/50 p-2.5 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <ZoomIn size={16} className="text-marfil/70" strokeWidth={1.5} />
                </div>
              )}
              {fotos.length > 1 && (
                <>
                  <button onClick={e => { e.stopPropagation(); setFotoIdx(i => (i - 1 + fotos.length) % fotos.length) }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-negro/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-negro/80 backdrop-blur-sm">
                    <ChevronLeft size={16} className="text-marfil" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setFotoIdx(i => (i + 1) % fotos.length) }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-negro/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-negro/80 backdrop-blur-sm">
                    <ChevronRight size={16} className="text-marfil" />
                  </button>
                </>
              )}
              {/* Photo counter */}
              {fotos.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-negro/60 text-marfil/60 text-xs px-2.5 py-1 backdrop-blur-sm">
                  {fotoIdx + 1} / {fotos.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {fotos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {fotos.map((foto, idx) => (
                  <button key={idx} onClick={() => setFotoIdx(idx)}
                    className={`flex-shrink-0 w-16 h-20 overflow-hidden transition-all ${idx === fotoIdx ? 'ring-1 ring-dorado opacity-100' : 'opacity-40 hover:opacity-70'}`}>
                    <img src={foto} alt="" className="w-full h-full object-cover object-top" />
                  </button>
                ))}
              </div>
            )}

            {/* Mobile dots */}
            {fotos.length > 1 && (
              <div className="flex justify-center gap-1.5 md:hidden">
                {fotos.map((_, i) => (
                  <button key={i} onClick={() => setFotoIdx(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === fotoIdx ? 'bg-dorado w-4' : 'bg-marfil/20'}`} />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col lg:pt-4">
            <span className="text-dorado/60 tracking-[0.2em] uppercase mb-3" style={{ fontSize: '11px' }}>{producto.categoria}</span>
            <h1 className="font-cormorant text-3xl md:text-4xl italic font-light mb-4 leading-tight">{producto.nombre}</h1>

            {/* Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-3 mb-5">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={14} className={s <= Math.round(promedioEstrellas) ? 'text-dorado fill-dorado' : 'text-marfil/15'} strokeWidth={1} />
                  ))}
                </div>
                <span className="text-marfil/40 text-xs">{promedioEstrellas} · {reviews.length} reseña{reviews.length !== 1 ? 's' : ''}</span>
              </div>
            )}

            {/* Price */}
            <div className="mb-6">
              <p className="font-cormorant text-3xl text-dorado">{formatPrecio(producto.precio)}</p>
              <p className="text-marfil/25 text-xs mt-1">Precio final · IVA incluido</p>
            </div>

            {/* Description */}
            {producto.descripcion && (
              <p className="text-marfil/50 text-sm leading-relaxed mb-6 pb-6 border-b border-marfil/8">{producto.descripcion}</p>
            )}

            {/* Stock */}
            <div className="mb-6">
              {producto.stock === 0 ? (
                <p className="text-red-400/70 text-sm flex items-center gap-2">Sin stock disponible</p>
              ) : producto.stock <= 3 ? (
                <p className="text-dorado text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-dorado animate-pulse" />
                  Solo {producto.stock} disponible{producto.stock !== 1 ? 's' : ''}
                </p>
              ) : (
                <p className="text-green-400/60 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400/60" />
                  En stock
                </p>
              )}
            </div>

            {/* CTA buttons */}
            <button
              onClick={handleAgregar}
              disabled={producto.stock === 0}
              className={`w-full flex items-center justify-center gap-3 py-4 text-sm tracking-wider uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                agregado
                  ? 'bg-dorado text-negro'
                  : 'bg-dorado/90 text-negro hover:bg-dorado'
              }`}
            >
              {agregado ? <Check size={16} /> : <ShoppingBag size={16} strokeWidth={1.5} />}
              {agregado ? '¡Agregado al carrito!' : 'Agregar al carrito'}
            </button>

            <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola! Me interesa el producto "${producto.nombre}" (${formatPrecio(producto.precio)})`)}`}
              target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 mt-3 py-3.5 text-xs border border-marfil/10 text-marfil/50 hover:border-green-400/30 hover:text-green-400/80 transition-all">
              <MessageCircle size={14} /> Consultá por este producto
            </a>

            <Link href="/citas" className="w-full flex items-center justify-center gap-2 mt-2 py-3.5 text-xs border border-dorado/15 text-dorado/60 hover:border-dorado/40 hover:text-dorado transition-all">
              <Sparkles size={14} /> ¿Querés algo personalizado? Agendar cita
            </Link>

            {/* Trust badges */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { icon: Truck, title: 'Envío nacional', sub: 'A todo el país' },
                { icon: Sparkles, title: '100% artesanal', sub: 'Hecho a mano' },
                { icon: Shield, title: 'Pago seguro', sub: 'MercadoPago' },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="text-center py-3 border border-marfil/5">
                  <Icon size={16} className="text-dorado/50 mx-auto mb-1.5" strokeWidth={1} />
                  <p className="text-marfil/60 font-medium" style={{ fontSize: '10px' }}>{title}</p>
                  <p className="text-marfil/25" style={{ fontSize: '9px' }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="border-t border-marfil/8 pt-12 mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-cormorant text-2xl italic">Reseñas</h2>
              {reviews.length > 0 && <p className="text-marfil/40 text-sm mt-1">{reviews.length} reseña{reviews.length !== 1 ? 's' : ''} · {promedioEstrellas} estrellas promedio</p>}
            </div>
            <button onClick={() => setShowReviewForm(!showReviewForm)} className="btn-ghost text-xs py-2.5 px-5">Dejar una reseña</button>
          </div>

          {showReviewForm && (
            <form onSubmit={enviarReview} className="card-dark mb-8 border border-dorado/15">
              <p className="text-xs text-dorado tracking-widest uppercase mb-5">Tu reseña</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Nombre *</label>
                  <input value={reviewForm.nombre} onChange={e => setReviewForm(r => ({ ...r, nombre: e.target.value }))} required className="input-dark w-full" /></div>
                <div><label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Email *</label>
                  <input type="email" value={reviewForm.email} onChange={e => setReviewForm(r => ({ ...r, email: e.target.value }))} required className="input-dark w-full" /></div>
              </div>
              <div className="mb-4">
                <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Calificación</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} type="button" onClick={() => setReviewForm(r => ({ ...r, estrellas: s }))} className="transition-all hover:scale-110">
                      <Star size={22} className={s <= reviewForm.estrellas ? 'text-dorado fill-dorado' : 'text-marfil/15'} strokeWidth={1} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-5"><label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Comentario *</label>
                <textarea value={reviewForm.comentario} onChange={e => setReviewForm(r => ({ ...r, comentario: e.target.value }))} required rows={3} className="input-dark w-full resize-none" placeholder="Contanos tu experiencia con el producto..." /></div>
              <div className="flex gap-3">
                <button type="submit" disabled={enviandoReview} className="btn-gold-fill flex-1 justify-center py-2.5 text-xs">Enviar reseña</button>
                <button type="button" onClick={() => setShowReviewForm(false)} className="btn-ghost flex-1 justify-center py-2.5 text-xs">Cancelar</button>
              </div>
            </form>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-marfil/8">
              <Star size={24} className="text-marfil/10 mx-auto mb-2" />
              <p className="text-marfil/25 text-sm">Sé el primero en dejar una reseña</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map(r => (
                <div key={r.id} className="card-dark">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-dorado/10 border border-dorado/20 flex items-center justify-center flex-shrink-0">
                        <span className="font-cormorant text-sm text-dorado">{r.nombre.charAt(0)}</span>
                      </div>
                      <p className="font-medium text-sm">{r.nombre}</p>
                    </div>
                    <p className="text-marfil/30 text-xs">{new Date(r.created_at).toLocaleDateString('es-AR')}</p>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} className={s <= r.estrellas ? 'text-dorado fill-dorado' : 'text-marfil/10'} strokeWidth={1} />)}
                  </div>
                  <p className="text-marfil/50 text-sm leading-relaxed">{r.comentario}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related products */}
        {relacionados.length > 0 && (
          <div className="border-t border-marfil/8 pt-12 pb-8">
            <h2 className="font-cormorant text-2xl italic mb-8">También te puede interesar</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {relacionados.map(p => (
                <Link key={p.id} href={`/tienda/${p.slug}`} className="group">
                  <div className="relative overflow-hidden bg-negro2" style={{ aspectRatio: '3/4' }}>
                    {p.imagenes?.[0] ? (
                      <img src={p.imagenes[0]} alt={p.nombre}
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-negro3 flex items-center justify-center">
                        <ShoppingBag size={28} className="text-marfil/8" strokeWidth={0.5} />
                      </div>
                    )}
                  </div>
                  <div className="pt-3 pb-1 px-1">
                    <p className="text-dorado/50 tracking-[0.15em] uppercase mb-1" style={{ fontSize: '10px' }}>{p.categoria}</p>
                    <p className="font-cormorant text-lg font-light group-hover:text-dorado transition-colors">{p.nombre}</p>
                    <p className="text-dorado font-cormorant text-lg mt-0.5">{formatPrecio(p.precio)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(9,9,9,0.95)', backdropFilter: 'blur(20px)' }} onClick={cerrarLightbox}>
          <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <p className="font-cormorant text-lg italic text-marfil/80">{producto.nombre}</p>
            <div className="flex items-center gap-4">
              <p className="text-marfil/30 text-xs">{lightboxIdx + 1} / {fotos.length}</p>
              <button onClick={cerrarLightbox} className="text-marfil/40 hover:text-marfil transition-colors"><X size={20} strokeWidth={1} /></button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center px-4 relative" onClick={e => e.stopPropagation()}>
            {fotos.length > 1 && (
              <button onClick={prevLightbox} className="absolute left-4 z-10 w-10 h-10 border border-marfil/15 flex items-center justify-center text-marfil/40 hover:text-dorado hover:border-dorado/40 transition-all">
                <ChevronLeft size={18} />
              </button>
            )}
            <img src={fotos[lightboxIdx]} alt={producto.nombre}
              className="max-h-[78vh] max-w-full object-contain" style={{ userSelect: 'none' }} />
            {fotos.length > 1 && (
              <button onClick={nextLightbox} className="absolute right-4 z-10 w-10 h-10 border border-marfil/15 flex items-center justify-center text-marfil/40 hover:text-dorado hover:border-dorado/40 transition-all">
                <ChevronRight size={18} />
              </button>
            )}
          </div>
          {fotos.length > 1 && (
            <div className="flex-shrink-0 flex gap-2 justify-center px-6 py-4" onClick={e => e.stopPropagation()}>
              {fotos.map((foto, idx) => (
                <button key={idx} onClick={() => setLightboxIdx(idx)}
                  className={`flex-shrink-0 overflow-hidden transition-all ${idx === lightboxIdx ? 'ring-1 ring-dorado opacity-100' : 'opacity-30 hover:opacity-60'}`}
                  style={{ width: '52px', height: '68px' }}>
                  <img src={foto} alt="" className="w-full h-full object-cover object-top" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sticky mobile CTA */}
      {showSticky && producto.stock > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-negro2 border-t border-marfil/10 px-4 py-3 flex items-center gap-3 md:hidden" style={{ backdropFilter: 'blur(12px)' }}>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{producto.nombre}</p>
            <p className="text-dorado font-cormorant text-lg">{formatPrecio(producto.precio)}</p>
          </div>
          <button onClick={handleAgregar}
            className={`flex-shrink-0 px-6 py-3 text-xs tracking-wider uppercase transition-all ${agregado ? 'bg-dorado text-negro' : 'bg-dorado/90 text-negro'}`}>
            {agregado ? 'Agregado ✓' : 'Agregar'}
          </button>
        </div>
      )}
    </div>
  )
}
