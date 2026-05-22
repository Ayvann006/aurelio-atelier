import Nav from '@/components/ui/Nav'
import Footer from '@/components/ui/Footer'
import CatalogoProductos from '@/components/tienda/CatalogoProductos'
import { createServiceClient } from '@/lib/supabase'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function TiendaPage() {
  const supabase = createServiceClient()
  const { data: productos } = await supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
    .order('destacado', { ascending: false })

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-28 pb-20 px-6 md:px-14">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="section-label">Tienda Selecta</span>
            <h1 className="font-cormorant text-4xl md:text-5xl font-light italic mb-3">
              Accesorios de Atelier
            </h1>
            <div className="gold-line mb-4" />
            <p className="text-marfil/40 text-sm">Piezas únicas para complementar tu look</p>
          </div>
          <CatalogoProductos productos={productos || []} />
        </div>
      </main>
      <Footer />
    </>
  )
}
