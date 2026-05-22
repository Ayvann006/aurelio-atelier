import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import WhatsAppFloat from '@/components/ui/WhatsAppFloat'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aurelio Martínez — Atelier de Alta Costura | Palermo, Buenos Aires',
  description: 'Atelier de alta costura en Palermo Hollywood, Buenos Aires. Especialistas en vestidos de novia, quinceañera, gala y certámenes de belleza. Diseños únicos bordados a mano.',
  keywords: ['atelier', 'alta costura', 'vestidos de novia', 'quinceañera', 'Buenos Aires', 'Palermo', 'Aurelio Martínez'],
  openGraph: {
    title: 'Aurelio Martínez — Alta Costura',
    description: 'Diseños únicos para los momentos que merecen lo extraordinario.',
    url: 'https://aureliomartinez.com',
    siteName: 'Aurelio Martínez Atelier',
    locale: 'es_AR',
    type: 'website',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Aurelio Martínez Atelier' }],
  },
  robots: { index: true, follow: true },
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {gaId && <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
          <script dangerouslySetInnerHTML={{ __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          ` }} />
        </>}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ClothingStore',
          name: 'Aurelio Martínez Atelier',
          description: 'Atelier de alta costura en Buenos Aires',
          address: { '@type': 'PostalAddress', streetAddress: 'El Salvador 5930', addressLocality: 'Palermo Hollywood', addressRegion: 'CABA', addressCountry: 'AR' },
          telephone: '+5491136205098',
          openingHours: 'Mo-Sa 10:00-19:00',
          sameAs: ['https://instagram.com/aureliomartinezmoda'],
        }) }} />
      </head>
      <body>
        {children}
        <WhatsAppFloat />
        <Toaster position="top-center" toastOptions={{ style: { background: '#111111', border: '0.5px solid rgba(201,169,110,0.3)', color: '#F5F0E8' } }} />
      </body>
    </html>
  )
}
