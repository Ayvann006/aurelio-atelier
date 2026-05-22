import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServiceClient()
  const { data: cita } = await supabase.from('citas').select('*').eq('id', params.id).single()
  if (!cita) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

  const fecha = cita.fecha.replace(/-/g, '')
  const hora = cita.hora.substring(0, 5).replace(':', '') + '00'
  const h = parseInt(hora.substring(0, 2))
  const horaFin = String(h + 1).padStart(2, '0') + hora.substring(2)

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Aurelio Martinez//ES',
    'BEGIN:VEVENT',
    `UID:${cita.id}@aureliomartinez.com`,
    `DTSTART:${fecha}T${hora}`,
    `DTEND:${fecha}T${horaFin}`,
    `SUMMARY:Cita Aurelio Martínez — ${cita.tipo_cita.replace(/-/g,' ')}`,
    `DESCRIPTION:Evento: ${cita.tipo_evento}\\nAtelier: El Salvador 5930\\, Palermo Hollywood\\, CABA`,
    `LOCATION:El Salvador 5930\\, Palermo Hollywood\\, CABA`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="cita-aurelio-martinez.ics"`,
    },
  })
}
