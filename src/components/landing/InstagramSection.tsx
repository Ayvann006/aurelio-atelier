import { Instagram } from 'lucide-react'

// Placeholder de posts de Instagram — reemplazar con embed real o API de Instagram
const POSTS = [
  { id: '1', img: '/images/hero.jpg', url: 'https://instagram.com/aureliomartinezmoda' },
  { id: '2', img: '/images/cat-miss.jpg', url: 'https://instagram.com/aureliomartinezmoda' },
  { id: '3', img: '/images/cat-quinces.jpg', url: 'https://instagram.com/aureliomartinezmoda' },
  { id: '4', img: '/images/cat-gala.jpg', url: 'https://instagram.com/aureliomartinezmoda' },
  { id: '5', img: '/images/cat-novias.jpg', url: 'https://instagram.com/aureliomartinezmoda' },
  { id: '6', img: '/images/cta-bg.jpg', url: 'https://instagram.com/aureliomartinezmoda' },
]

export default function InstagramSection() {
  return (
    <section className="py-20 px-6 md:px-14 bg-negro">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="section-label">Seguinos</span>
            <h2 className="font-cormorant text-3xl font-light italic">@aureliomartinezmoda</h2>
          </div>
          <a
            href="https://instagram.com/aureliomartinezmoda"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold flex items-center gap-2 text-xs py-2.5 px-5"
          >
            <Instagram size={13} strokeWidth={1.5} />
            Seguir en Instagram
          </a>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-px">
          {POSTS.map(post => (
            <a
              key={post.id}
              href={post.url}
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
          Actualizá las fotos desde el panel de administración
        </p>
      </div>
    </section>
  )
}
