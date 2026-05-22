import Link from 'next/link'

const CATS = [
  { nombre: 'Novias', num: '01', img: '/images/cat-novias.jpg', href: '/colecciones/novias' },
  { nombre: 'Quinceañeras', num: '02', img: '/images/cat-quinces.jpg', href: '/colecciones/quinceaneras' },
  { nombre: 'Gala & Cóctel', num: '03', img: '/images/cat-gala.jpg', href: '/colecciones/gala' },
  { nombre: 'Miss & Certámenes', num: '04', img: '/images/cat-miss.jpg', href: '/colecciones/miss' },
]

export default function CategoriasSection() {
  return (
    <section className="py-24 px-6 md:px-14" id="colecciones">
      <div className="max-w-7xl mx-auto mb-12">
        <span className="section-label">Colecciones 2025</span>
        <h2 className="section-title">Cada ocasión,<br /><em className="italic">una obra maestra</em></h2>
        <div className="gold-line" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px max-w-7xl mx-auto">
        {CATS.map((cat) => (
          <Link key={cat.nombre} href={cat.href}
            className="relative overflow-hidden group"
            style={{ aspectRatio: '2/3' }}>
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url('${cat.img}')`, filter: 'brightness(0.45)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-negro/90 via-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="block text-dorado text-xs tracking-widest mb-2">{cat.num}</span>
              <span className="block font-cormorant text-xl md:text-2xl italic font-light text-marfil mb-2">{cat.nombre}</span>
              <span className="text-dorado text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                Ver galería →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
