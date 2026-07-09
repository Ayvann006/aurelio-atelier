import Link from 'next/link'
import { getConfiguracionSitio } from '@/lib/supabase'

export default async function HeroSection() {
  const config = await getConfiguracionSitio()
  const heroImagen = config?.hero_imagen || '/images/hero.jpg'

  return (
    <section className="relative h-screen min-h-[640px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${heroImagen}')`, filter: 'brightness(0.25)' }}
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(9,9,9,0.2) 0%, rgba(9,9,9,0.6) 50%, rgba(9,9,9,0.95) 100%)' }} />
      <div className="relative text-center px-6 max-w-4xl mx-auto">
        <span className="block text-dorado text-xs tracking-[0.4em] uppercase mb-8 animate-fade-in">
          Alta Costura · Buenos Aires
        </span>
        <h1 className="font-cormorant text-5xl md:text-7xl font-light italic leading-[1.02] mb-6 animate-fade-up">
          Donde el sueño<br />se convierte<br />en vestido
        </h1>
        <div className="w-10 h-px bg-dorado mx-auto mb-6" />
        <p className="text-marfil/60 text-sm tracking-wider mb-10 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          Creaciones únicas bordadas a mano · El Salvador 5930, Palermo Hollywood
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.5s' }}>
          <Link href="/citas" className="btn-gold-fill px-10 py-4 text-xs">
            Agendar Mi Cita
          </Link>
          <Link href="/tienda" className="btn-ghost px-10 py-4 text-xs">
            Ver Tienda
          </Link>
        </div>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <span className="text-marfil/40 text-xs tracking-[0.3em] uppercase">Descubrir</span>
        <div className="w-px h-8 bg-gradient-to-b from-dorado/60 to-transparent" />
      </div>
    </section>
  )
}
