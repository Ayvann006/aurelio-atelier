import { createServiceClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Nav from '@/components/ui/Nav'
import Footer from '@/components/ui/Footer'
import { generarLinkGoogleCalendar } from '@/lib/notificaciones'
import { Calendar, Clock, MapPin, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function MiCitaPage({ params }: { params: { id: string } }) {
  const supabase = createServiceClient()
  const { data: cita } = await supabase
    .from('citas')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!cita) notFound()

  const gcal = generarLinkGoogleCalendar({
    fecha: cita.fecha,
    hora: cita.hora,
    tipo_cita: cita.tipo_cita,
    tipo_evento: cita.tipo_evento,
    cliente_nombre: cita.cliente_nombre,
  })

  const waLink = `https://wa.me/5491136205098?text=${encodeURIComponent(`Hola! Tengo una cita el ${cita.fecha} a las ${cita.hora} hs. Mi nombre es ${cita.cliente_nombre}.`)}`

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-28 pb-20 px-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <p className="font-cormorant text-lg tracking-widest uppercase text-dorado mb-2">Aurelio Martínez</p>
            <h1 className="font-cormorant text-4xl italic font-light mb-2">Tu Cita Confirmada</h1>
            <div className="gold-line mx-auto" />
          </div>

          <div className="card-dark space-y-4 mb-6">
            <p className="text-dorado text-xs tracking-widest uppercase mb-4">Detalles de tu cita</p>
            <div className="flex items-center gap-3">
              <Calendar size={14} className="text-dorado flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-xs text-marfil/40 uppercase tracking-wider">Fecha</p>
                <p className="text-sm capitalize">{new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={14} className="text-dorado flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-xs text-marfil/40 uppercase tracking-wider">Hora</p>
                <p className="text-sm">{cita.hora.substring(0, 5)} hs</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={14} className="text-dorado flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-xs text-marfil/40 uppercase tracking-wider">Dirección</p>
                <p className="text-sm">El Salvador 5930, Palermo Hollywood</p>
                <p className="text-marfil/40 text-xs">CABA, Argentina</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <p className="text-xs text-marfil/40 uppercase tracking-wider text-center mb-4">Agendá en tu calendario</p>
            <a href={gcal} target="_blank" rel="noopener noreferrer"
              className="btn-gold w-full justify-center py-3.5 flex items-center gap-2 text-xs">
              <Calendar size={14} /> Google Calendar
            </a>
            <a href={`/mi-cita/${params.id}/ics`}
              className="btn-ghost w-full justify-center py-3.5 flex items-center gap-2 text-xs">
              <Calendar size={14} /> Apple Calendar (.ics)
            </a>
          </div>

          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-marfil/40 text-sm hover:text-green-400 transition-colors">
            <MessageCircle size={14} /> Consultar por WhatsApp
          </a>
        </div>
      </main>
      <Footer />
    </>
  )
}
