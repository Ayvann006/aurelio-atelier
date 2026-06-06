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

          {/* Hero */}
          <div className="mb-10 md:mb-14">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <div>
                <span className="text-dorado/50 tracking-[0.25em] uppercase text-xs">Tienda Exclusiva</span>
                <h1 className="font-cormorant text-4xl md:text-5xl font-light italic mt-2 leading-tight">
                  Accesorios de Atelier
                </h1>
                <div className="w-10 h-px bg-dorado/40 mt-4" />
              </div>
              <p className="text-marfil/35 text-sm max-w-md leading-relaxed">
                Piezas únicas, confeccionadas artesanalmente con los más finos materiales. Cada accesorio es una obra de arte diseñada para complementar tu look.
              </p>
            </div>
          </div>

          <CatalogoProductos productos={productos || []} />
        </div>
      </main>
      <Footer />
    </>
  )
}
