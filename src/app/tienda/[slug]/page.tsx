import Nav from '@/components/ui/Nav'
import Footer from '@/components/ui/Footer'
import ProductoDetalle from '@/components/tienda/ProductoDetalle'
import { createServiceClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ProductoPage({ params }: { params: { slug: string } }) {
  const supabase = createServiceClient()
  const { data: producto } = await supabase
    .from('productos')
    .select('*')
    .eq('slug', params.slug)
    .eq('activo', true)
    .single()

  if (!producto) notFound()

  const { data: relacionados } = await supabase
    .from('productos')
    .select('*')
    .eq('categoria', producto.categoria)
    .eq('activo', true)
    .neq('id', producto.id)
    .limit(3)

  const { data: reviews } = await supabase
    .from('reviews_productos')
    .select('*')
    .eq('producto_id', producto.id)
    .eq('activo', true)
    .order('created_at', { ascending: false })

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-24 pb-20">
        <ProductoDetalle producto={producto} relacionados={relacionados || []} reviews={reviews || []} />
      </main>
      <Footer />
    </>
  )
}
