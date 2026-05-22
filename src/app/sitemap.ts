import { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aureliomartinez.com'
  const supabase = createServiceClient()
  const { data: productos } = await supabase.from('productos').select('slug, updated_at').eq('activo', true)

  const staticPages = [
    { url: appUrl, changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${appUrl}/citas`, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${appUrl}/tienda`, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${appUrl}/colecciones/novias`, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${appUrl}/colecciones/quinceaneras`, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${appUrl}/colecciones/gala`, changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${appUrl}/colecciones/miss`, changeFrequency: 'weekly' as const, priority: 0.7 },
  ]

  const productPages = (productos || []).map(p => ({
    url: `${appUrl}/tienda/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...productPages]
}
