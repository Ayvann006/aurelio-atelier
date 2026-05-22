import Nav from '@/components/ui/Nav'
import Footer from '@/components/ui/Footer'
import GaleriaColeccion from '@/components/landing/GaleriaColeccion'
import { createServiceClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export const revalidate = 0
export const dynamic = 'force-dynamic'

const COLECCIONES: Record<string, { titulo: string; subtitulo: string; descripcion: string }> = {
  novias: {
    titulo: 'Novias',
    subtitulo: 'Colección Nupcial',
    descripcion: 'Cada vestido de novia nace de un proceso artesanal único. Diseños que capturan la esencia de tu historia de amor.'
  },
  quinceaneras: {
    titulo: 'Quinceañeras',
    subtitulo: 'Colección Quinceañera',
    descripcion: 'El día más mágico de su vida merece un vestido que lo haga aún más especial. Diseños únicos para la quinceañera de hoy.'
  },
  gala: {
    titulo: 'Gala & Cóctel',
    subtitulo: 'Colección Gala',
    descripcion: 'Elegancia sin concesiones. Vestidos de gala que combinan sofisticación europea con la pasión latinoamericana.'
  },
  miss: {
    titulo: 'Miss & Certámenes',
    subtitulo: 'Colección Certámenes',
    descripcion: 'Vestidos diseñados para reinas. Cada creación está pensada para brillar bajo los reflectores del escenario.'
  },
}

export default async function GaleriaPage({ params }: { params: { slug: string } }) {
  const coleccion = COLECCIONES[params.slug]
  if (!coleccion) notFound()

  const supabase = createServiceClient()
  const { data: vestidos, error } = await supabase
    .from('colecciones')
    .select('*')
    .eq('categoria', params.slug)
    .eq('activo', true)
    .order('orden', { ascending: true })

  if (error) console.error('Error cargando coleccion:', error)

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-28 pb-20">
        <div className="px-6 md:px-14 mb-12">
          <div className="max-w-7xl mx-auto">
            <span className="section-label">{coleccion.subtitulo}</span>
            <h1 className="font-cormorant text-5xl md:text-6xl font-light italic mb-4">{coleccion.titulo}</h1>
            <div className="gold-line mb-4" />
            <p className="text-marfil/50 text-sm max-w-xl leading-relaxed">{coleccion.descripcion}</p>
          </div>
        </div>
        <GaleriaColeccion vestidos={vestidos || []} categoria={params.slug} />
      </main>
      <Footer />
    </>
  )
}

export function generateStaticParams() {
  return Object.keys(COLECCIONES).map(slug => ({ slug }))
}
