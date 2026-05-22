import Nav from '@/components/ui/Nav'
import Footer from '@/components/ui/Footer'
import HeroSection from '@/components/landing/HeroSection'
import CategoriasSection from '@/components/landing/CategoriasSection'
import SobreAurelioSection from '@/components/landing/SobreAurelioSection'
import ProcesoSection from '@/components/landing/ProcesoSection'
import TestimoniosSection from '@/components/landing/TestimoniosSection'
import InstagramSection from '@/components/landing/InstagramSection'
import CTASection from '@/components/landing/CTASection'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <>
      <Nav />
      <HeroSection />
      <CategoriasSection />
      <SobreAurelioSection />
      <ProcesoSection />
      <TestimoniosSection />
      <InstagramSection />
      <CTASection />
      <Footer />
    </>
  )
}
