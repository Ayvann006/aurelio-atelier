export default function ProcesoSection() {
  const pasos = [
    { num: '01', title: 'Primera Entrevista', desc: 'Nos conocemos, escuchamos tu visión y entendemos cada detalle de tu sueño.' },
    { num: '02', title: 'Diseño & Tejido', desc: 'Aurelio crea bocetos únicos y selecciona las telas y cristales más exclusivos.' },
    { num: '03', title: 'Pruebas & Ajustes', desc: 'Varias sesiones para lograr un ajuste perfecto a tu cuerpo y personalidad.' },
    { num: '04', title: 'Entrega Final', desc: 'Recibís tu vestido terminado, listo para el momento más importante.' },
  ]
  return (
    <section className="py-24 px-6 md:px-14">
      <div className="max-w-7xl mx-auto">
        <span className="section-label">Cómo trabajamos</span>
        <h2 className="section-title">Tu vestido,<br /><em className="italic">paso a paso</em></h2>
        <div className="gold-line mb-14" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-px">
          {pasos.map((p) => (
            <div key={p.num} className="card-dark text-center group hover:border-dorado/20 transition-colors">
              <p className="font-cormorant text-5xl font-light italic text-dorado/20 mb-4 group-hover:text-dorado/35 transition-colors">{p.num}</p>
              <p className="font-cormorant text-lg mb-3">{p.title}</p>
              <p className="text-marfil/40 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
