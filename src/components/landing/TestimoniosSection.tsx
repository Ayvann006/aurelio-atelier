'use client'
import { useEffect, useState } from 'react'

interface Resena {
  autor: string
  texto: string
  evento: string
  estrellas: number
  fuente: 'google' | 'manual'
}

// Reseñas base — se muestran siempre
const RESENAS_BASE: Resena[] = [
  { autor: 'Ailen Velardez', texto: 'Super, super contenta con el trabajo de Aurelio. Un genio total. Super atento, cuidadoso y cariñoso. Desde el primer día me recibió de 10. El vestido que realizó fue un sueño. Super recomendado, si necesitan un vestido, no duden en ir con él. El mejor lejos', evento: 'Novia', estrellas: 5, fuente: 'google' },
  { autor: 'Anabella Macchia', texto: 'Hermoso trabajo con nuestros vestidos fueron como lo soñamos y esa magia la logro Aurelio con su toque, buena onda y predisposiocion.', evento: 'Quinceañera', estrellas: 5, fuente: 'google' },
  { autor: 'Maritza Rodríguez', texto: 'Conocí a Aurelio y desde el primer día logró entender todo lo que quería. Es un gran diseñador, hizo el vestido de novia de mi sueños con el toque de su marca de alta costura y totalmente personalizado. Sin dudas logró que el día de mi boda fuera mágico.', evento: 'Novia', estrellas: 5, fuente: 'google' },
]

export default function TestimoniosSection() {
  const [resenas, setResenas] = useState<Resena[]>(RESENAS_BASE)

  return (
    <section className="py-24 px-6 md:px-14 bg-negro2">
      <div className="max-w-7xl mx-auto">
        <span className="section-label">Reseñas de Google</span>
        <h2 className="section-title">Lo que dicen<br /><em className="italic">nuestras clientas</em></h2>
        <div className="gold-line mb-14" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px">
          {resenas.map((t, i) => (
            <div key={i} className="bg-negro3 p-8 hover:bg-[#1c1c1c] transition-colors">
              <div className="flex items-center justify-between mb-5">
                <p className="text-dorado text-sm tracking-widest">{'★'.repeat(t.estrellas)}</p>
                <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-30" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <p className="font-cormorant text-lg italic font-light leading-relaxed text-marfil mb-6">"{t.texto}"</p>
              <p className="text-dorado text-xs tracking-widest uppercase">{t.autor}</p>
              <p className="text-marfil/30 text-xs mt-1">{t.evento}</p>
              <div className="mt-4 pt-4 border-t border-marfil/5 flex items-center gap-2">
                <span className="text-marfil/25 text-xs">✓ Reseña de Google</span>
              </div>
            </div>
          ))}
        </div>

        {/* Link a Google Reviews */}
        <div className="text-center mt-8">
          <a
            href="https://share.google/a16Plkwt8u7vkIYQ0"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost inline-flex items-center gap-2 text-xs"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Ver todas las reseñas en Google
          </a>
        </div>
      </div>
    </section>
  )
}
