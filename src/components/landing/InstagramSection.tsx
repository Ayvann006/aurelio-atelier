import { Instagram } from 'lucide-react'
import { getConfiguracionSitio } from '@/lib/supabase'

// Fallback si todavía no se cargaron fotos de Instagram desde el Admin
const FALLBACKS = ['/images/hero.jpg', '/images/cat-miss.jpg', '/images/cat-quinces.jpg', '/images/cat-gala.jpg', '/images/cat-novias.jpg', '/images/cta-bg.jpg']
const IG_URL = 'https://instagram.com/aureliomartinezmoda'

export default async function InstagramSection() {
  const config = await getConfiguracionSitio()
  const guardadas: string[] = Array.isArray(config?.instagram_imagenes) ? config.instagram_imagenes : []
  const posts = FALLBACKS.map((fallback, i) => ({ id: String(i + 1), img: guardadas[i] || fallback }))

  return (
    <section className="py-20 px-6 md:px-14 bg-negro">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="section-label">Seguinos</span>
            <h2 className="font-cormorant text-3xl font-light italic">@aureliomartinezmoda</h2>
          </div>
          <a
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold flex items-center gap-2 text-xs py-2.5 px-5"
          >
            <Instagram size={13} strokeWidth={1.5} />
            Seguir en Instagram
          </a>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-px">
          {posts.map(post => (
            <a
              key={post.id}
              href={IG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden group aspect-square"
            >
              <img
                src={post.img}
                alt="Instagram Aurelio Martínez"
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                style={{ filter: 'brightness(0.6)' }}
              />
              <div className="absolute inset-0 bg-negro/0 group-hover:bg-negro/40 transition-all duration-300 flex items-center justify-center">
                <Instagram size={20} className="text-marfil opacity-0 group-hover:opacity-100 transition-opacity duration-300" strokeWidth={1} />
              </div>
            </a>
          ))}
        </div>

        <p className="text-center text-marfil/20 text-xs mt-4 tracking-wider">
          Síguenos en Instagram para no perderte ninguna novedad
        </p>
      </div>
    </section>
  )
}
