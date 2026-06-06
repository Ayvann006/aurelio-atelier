import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="relative py-36 px-6 text-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/cta-bg.jpg')", filter: 'brightness(0.1)' }}
      />
      <div className="absolute inset-0 bg-negro/70" />
      <div className="relative">
        <span className="block text-dorado text-xs tracking-[0.4em] uppercase mb-5">Atención Exclusiva</span>
        <h2 className="font-cormorant text-5xl md:text-6xl italic font-light leading-tight mb-4">
          Tu momento<br />más especial<br /><em>comienza aquí</em>
        </h2>
        <p className="text-marfil/40 text-sm tracking-wider mb-10">
          Lunes a Viernes 11:00 — 19:00 hs / Sábados 11:00 — 16:00 hs
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/citas" className="btn-gold-fill px-12 py-4 text-xs">
            Agendar Mi Cita
          </Link>
          <a href="https://wa.me/5491136205098" className="btn-ghost px-12 py-4 text-xs">
            WhatsApp
          </a>
        </div>
        <p className="text-marfil/20 text-xs mt-6 tracking-wider">
          Pago de seña por MercadoPago · Confirmación inmediata
        </p>
      </div>
    </section>
  )
}
