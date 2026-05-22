import Link from 'next/link'
import { MapPin, Phone, Clock, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-negro2 border-t border-dorado/10" id="contacto">
      {/* Google Maps */}
      <div className="w-full h-64 relative overflow-hidden border-b border-dorado/10">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.198!2d-58.4297!3d-34.5876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sEl+Salvador+5930%2C+Palermo+Hollywood%2C+CABA!5e0!3m2!1ses!2sar!4v1!5m2!1ses!2sar&q=El+Salvador+5930,+Palermo+Hollywood,+CABA,+Argentina"
          width="100%"
          height="100%"
          style={{ border: 0, filter: 'grayscale(100%) invert(90%) contrast(85%) brightness(0.4)' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Ubicación Aurelio Martínez Atelier"
        />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent 60%, rgba(17,17,17,0.8) 100%)' }} />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-negro/90 border border-dorado/30 px-4 py-2 flex items-center gap-2">
          <MapPin size={13} className="text-dorado" strokeWidth={1.5} />
          <span className="text-marfil/80 text-xs tracking-wider">El Salvador 5930, Palermo Hollywood</span>
        </div>
      </div>

      <div className="px-8 md:px-14 pt-12 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <p className="font-cormorant text-lg tracking-[0.25em] uppercase mb-4">Aurelio Martínez</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin size={13} className="text-dorado mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <p className="text-marfil/50 text-sm leading-relaxed">El Salvador 5930, Palermo Hollywood<br />CABA, Argentina</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={13} className="text-dorado flex-shrink-0" strokeWidth={1.5} />
                  <a href="https://wa.me/5491136205098" className="text-marfil/50 text-sm hover:text-dorado transition-colors">+54 9 11 3620-5098</a>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={13} className="text-dorado flex-shrink-0" strokeWidth={1.5} />
                  <p className="text-marfil/50 text-sm">Lunes a Sábados · 10:00 — 19:00 hs</p>
                </div>
                <div className="flex items-center gap-3">
                  <Instagram size={13} className="text-dorado flex-shrink-0" strokeWidth={1.5} />
                  <a href="https://instagram.com/aureliomartinezmoda" target="_blank" rel="noopener noreferrer"
                    className="text-marfil/50 text-sm hover:text-dorado transition-colors">@aureliomartinezmoda</a>
                </div>
              </div>
            </div>
            <div>
              <p className="text-dorado text-xs tracking-widest uppercase mb-5">Colecciones</p>
              <ul className="space-y-2.5">
                {[
                  ['Novias', '/colecciones/novias'],
                  ['Quinceañeras', '/colecciones/quinceaneras'],
                  ['Gala & Cóctel', '/colecciones/gala'],
                  ['Miss & Certámenes', '/colecciones/miss'],
                ].map(([l, h]) => (
                  <li key={l}><Link href={h} className="text-marfil/50 text-sm hover:text-dorado transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-dorado text-xs tracking-widest uppercase mb-5">Atelier</p>
              <ul className="space-y-2.5">
                {[
                  ['Agendar Cita', '/citas'],
                  ['Tienda', '/tienda'],
                  ['Contacto', '/#contacto'],
                ].map(([l, h]) => (
                  <li key={l}><Link href={h} className="text-marfil/50 text-sm hover:text-dorado transition-colors">{l}</Link></li>
                ))}
                <li className="pt-2">
                  <a href="https://wa.me/5491136205098" className="btn-gold text-xs py-2 px-4 inline-flex">
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-marfil/8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-marfil/30 text-xs tracking-wider">© 2025 Aurelio Martínez Atelier — Todos los derechos reservados</p>
            <div className="flex gap-6">
              <a href="https://instagram.com/aureliomartinezmoda" target="_blank" rel="noopener noreferrer" className="text-marfil/30 text-xs tracking-widest uppercase hover:text-dorado transition-colors">Instagram</a>
              <a href="https://wa.me/5491136205098" className="text-marfil/30 text-xs tracking-widest uppercase hover:text-dorado transition-colors">WhatsApp</a>
              <a href="https://g.page/r/aurelio-martinez" target="_blank" rel="noopener noreferrer" className="text-marfil/30 text-xs tracking-widest uppercase hover:text-dorado transition-colors">Google</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
