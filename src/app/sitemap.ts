import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aureliomartinez.com'

  return [
    { url: appUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${appUrl}/citas`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${appUrl}/tienda`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${appUrl}/colecciones/novias`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${appUrl}/colecciones/quinceaneras`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${appUrl}/colecciones/gala`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${appUrl}/colecciones/miss`, changeFrequency: 'weekly', priority: 0.7 },
  ]
}