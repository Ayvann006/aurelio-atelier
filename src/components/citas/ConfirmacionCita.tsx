'use client'
import Link from 'next/link'
import { CheckCircle, Calendar, Clock, MessageCircle, Phone, Mail } from 'lucide-react'
import { formatFecha, formatHora } from '@/lib/utils'
import type { Cita } from '@/types'

interface Props {
  cita: Cita
  waClientaLink?: string
  emailEnviado?: boolean
  linkCita?: string
}

export default function ConfirmacionCita({ cita, waClientaLink, emailEnviado, linkCita }: Props) {
  const gcal = linkCita
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Cita Aurelio Martínez')}&dates=${cita.fecha.replace(/-/g,'')}T${cita.hora.replace(':','')}00/${cita.fecha.replace(/-/g,'')}T${String(parseInt(cita.hora.split(':')[0])+1).padStart(2,'0')}${cita.hora.split(':')[1]}00&location=${encodeURIComponent('El Salvador 5930, Palermo Hollywood, CABA')}`
    : '#'

  return (
    <div className="text-center space-y-8">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border border-dorado/30 flex items-center justify-center mb-6">
          <CheckCircle size={28} className="text-dorado" strokeWidth={1} />
        </div>
        <h2 className="font-cormorant text-3xl italic font-light mb-2">¡Cita Confirmada!</h2>
        <p className="text-marfil/50 text-sm">
          {emailEnviado
            ? <>Te enviamos un email de confirmación a <span className="text-dorado">{cita.cliente_email}</span></>
            : <>Guardá los datos de tu cita</>
          }
        </p>
      </div>

      <div className="card-dark text-left space-y-4">
        <p className="text-dorado text-xs tracking-widest uppercase mb-4">Detalles de tu cita</p>
        <div className="flex items-center gap-3">
          <Calendar size={14} className="text-dorado" strokeWidth={1.5} />
          <span className="text-sm capitalize">{formatFecha(cita.fecha)}</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock size={14} className="text-dorado" strokeWidth={1.5} />
          <span className="text-sm">{formatHora(cita.hora)}</span>
        </div>
        <div className="flex items-center gap-3">
          <Phone size={14} className="text-dorado" strokeWidth={1.5} />
          <span className="text-sm">El Salvador 5930, Palermo Hollywood, CABA</span>
        </div>
        {cita.sena_pagada && (
          <div className="mt-4 pt-4 border-t border-dorado/15">
            <span className="text-xs bg-dorado/15 text-dorado px-3 py-1 tracking-wider">✓ Seña abonada</span>
          </div>
        )}
      </div>

      {/* Calendario links */}
      <div className="space-y-3">
        <p className="text-xs text-marfil/30 uppercase tracking-wider">Agendá en tu calendario</p>
        <div className="grid grid-cols-2 gap-3">
          <a href={gcal} target="_blank" rel="noopener noreferrer"
            className="btn-gold justify-center py-3 flex items-center gap-2 text-xs">
            <Calendar size={13} /> Google Calendar
          </a>
          {linkCita && (
            <a href={`${linkCita}/ics`}
              className="btn-ghost justify-center py-3 flex items-center gap-2 text-xs">
              <Calendar size={13} /> Apple Calendar
            </a>
          )}
        </div>
      </div>

      {/* WhatsApp al cliente */}
      {waClientaLink && (
        <a href={waClientaLink} target="_blank" rel="noopener noreferrer"
          className="btn-gold w-full justify-center py-4 gap-2 flex items-center">
          <MessageCircle size={15} strokeWidth={1.5} />
          Confirmar por WhatsApp
        </a>
      )}

      <Link href="/" className="block text-marfil/40 text-sm hover:text-dorado transition-colors">
        ← Volver al inicio
      </Link>
    </div>
  )
}
