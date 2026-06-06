'use client'
import { useState } from 'react'
import Nav from '@/components/ui/Nav'
import Footer from '@/components/ui/Footer'
import CalendarioCitas from '@/components/citas/CalendarioCitas'
import FormularioCita from '@/components/citas/FormularioCita'
import ConfirmacionCita from '@/components/citas/ConfirmacionCita'

export type PasoCita = 'calendario' | 'formulario' | 'confirmacion'

export interface DatosCita {
  fecha: string
  hora: string
  cliente_nombre: string
  cliente_email: string
  cliente_telefono: string
  tipo_evento: string
  tipo_cita: string
  notas: string
}

export default function CitasPage() {
  const [paso, setPaso] = useState<PasoCita>('calendario')
  const [datos, setDatos] = useState<Partial<DatosCita>>({})
  const [citaCreada, setCitaCreada] = useState<{cita:any,waLink?:string,emailEnviado?:boolean,linkCita?:string}|null>(null)

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-24 pb-20 px-6 md:px-14">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="text-center mb-14">
            <span className="section-label">Reserva tu lugar</span>
            <h1 className="font-cormorant text-4xl md:text-5xl italic font-light mb-4">
              Agendar una Cita
            </h1>
            <div className="gold-line mx-auto mb-4" />
            <p className="text-marfil/50 text-sm tracking-wide">
              Lunes a Viernes 11:00 a 19:00 hs / Sábados 11:00 a 16:00 hs
           </p>
            <p className="text-marfil/50 text-sm tracking-wide">
                El Salvador 5930, Palermo Hollywood, CABA
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-0 mb-12">
            {[
              { id: 'calendario', label: 'Fecha & Hora' },
              { id: 'formulario', label: 'Tus Datos' },
              { id: 'confirmacion', label: 'Confirmación' },
            ].map((p, i) => (
              <div key={p.id} className="flex items-center">
                <div className={`flex flex-col items-center ${i > 0 ? 'ml-0' : ''}`}>
                  <div className={`w-8 h-8 flex items-center justify-center border text-xs transition-all ${paso === p.id ? 'border-dorado bg-dorado text-negro' : ['confirmacion'].includes(paso) && i < 2 || paso === 'confirmacion' && i < 2 ? 'border-dorado/50 text-dorado' : 'border-marfil/20 text-marfil/30'}`}>
                    {i + 1}
                  </div>
                  <span className="text-xs text-marfil/40 mt-1.5 tracking-wider">{p.label}</span>
                </div>
                {i < 2 && <div className="w-20 h-px bg-marfil/10 mx-2 mb-5" />}
              </div>
            ))}
          </div>

          {/* Steps */}
          {paso === 'calendario' && (
            <CalendarioCitas
              onSeleccionar={(fecha, hora) => {
                setDatos((d) => ({ ...d, fecha, hora }))
                setPaso('formulario')
              }}
            />
          )}
          {paso === 'formulario' && (
            <FormularioCita
              fecha={datos.fecha!}
              hora={datos.hora!}
              onVolver={() => setPaso('calendario')}
              onConfirmar={(cita, waLink, emailEnviado, linkCita) => {
                setCitaCreada({ cita, waLink, emailEnviado, linkCita })
                setPaso('confirmacion')
              }}
            />
          )}
          {paso === 'confirmacion' && citaCreada && (
            <ConfirmacionCita cita={citaCreada.cita} waClientaLink={citaCreada.waLink} emailEnviado={citaCreada.emailEnviado} linkCita={citaCreada.linkCita} />
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
