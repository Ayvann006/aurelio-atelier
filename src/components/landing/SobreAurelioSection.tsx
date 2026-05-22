import Link from 'next/link'
import Image from 'next/image'

export default function SobreAurelioSection() {
  return (
    <section className="py-24 px-6 md:px-14 bg-negro2">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
        <div className="relative">
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image src="/images/aurelio.jpg" alt="Aurelio Martínez" fill className="object-cover object-top brightness-90" />
          </div>
          <div className="absolute inset-2 -right-3 -bottom-3 border border-dorado/20 pointer-events-none hidden md:block" />
        </div>
        <div>
          <span className="section-label">El Creador</span>
          <blockquote className="font-cormorant text-3xl md:text-4xl italic font-light leading-snug mb-6 pl-5 border-l-2 border-dorado">
            "Cada mujer lleva una historia que merece ser contada en seda y bordado."
          </blockquote>
          <p className="text-marfil/50 text-sm leading-loose mb-6">
            Aurelio Martínez es un diseñador de alta costura con más de 15 años vistiendo a las mujeres más importantes de Latinoamérica. Su atelier en Palermo Hollywood es un santuario donde cada vestido nace de un proceso artesanal riguroso y una atención completamente personalizada.<br /><br />
            Especializado en novias, quinceañeras, gala y certámenes de belleza, Aurelio combina técnicas europeas de bordado con la pasión del alma latinoamericana.
          </p>
          <p className="font-cormorant text-xl italic text-dorado mb-8">— Aurelio Martínez</p>
          <div className="grid grid-cols-3 gap-4 border-t border-marfil/8 pt-6 mb-8">
            {[['15+', 'Años'], ['500+', 'Clientas'], ['100%', 'A mano']].map(([n, l]) => (
              <div key={l}>
                <p className="font-cormorant text-3xl font-light text-dorado">{n}</p>
                <p className="text-marfil/30 text-xs tracking-wider uppercase mt-1">{l}</p>
              </div>
            ))}
          </div>
          <Link href="/citas" className="btn-gold">Agendar una cita</Link>
        </div>
      </div>
    </section>
  )
}
