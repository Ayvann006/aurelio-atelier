import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrecio(precio: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', minimumFractionDigits: 0,
  }).format(precio)
}

export function formatFecha(fecha: string): string {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}

export function formatHora(hora: string): string {
  const [h, m] = hora.split(':')
  return `${h}:${m} hs`
}

// Lunes a viernes: 11:00 - 18:00. Sábados: 11:00 - 16:00. Domingo cerrado.
export function getHorariosDisponibles(fecha: string): string[] {
  const d = new Date(fecha + 'T00:00:00')
  const dow = d.getDay() // 0=Dom, 6=Sáb
  if (dow === 0) return [] // Domingo cerrado
  if (dow === 6) return ['11:00','12:00','13:00','14:00','15:00','16:00'] // Sábado: 11 a 16
  return ['11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'] // Lunes a viernes: 11 a 18
}

export const HORARIOS_DISPONIBLES = ['11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']

// Buenos Aires es UTC-3 todo el año (no tiene horario de verano desde 2009).
function fechaHoraCitaAUTC(fecha: string, hora: string): Date {
  const [y, m, d] = fecha.split('-').map(Number)
  const [hh, mm] = hora.split(':').map(Number)
  return new Date(Date.UTC(y, m - 1, d, hh + 3, mm))
}

// Las citas solo se pueden agendar con un mínimo de horas de antelación (por defecto 4hs).
export function cumpleAntelacionMinima(fecha: string, hora: string, horasMinimas = 4): boolean {
  const citaUTC = fechaHoraCitaAUTC(fecha, hora)
  return citaUTC.getTime() - Date.now() >= horasMinimas * 60 * 60 * 1000
}

export const TIPOS_EVENTO = [
  { value: 'novia', label: 'Novia' },
  { value: 'quinceanera', label: 'Quinceañera' },
  { value: 'gala', label: 'Gala / Cóctel' },
  { value: 'miss', label: 'Miss / Certamen' },
  { value: 'otro', label: 'Otro' },
]

export const TIPOS_CITA = [
  { value: 'primera-entrevista', label: 'Primera Entrevista', duracion: 60 },
  { value: 'prueba', label: 'Prueba de Vestido', duracion: 90 },
  { value: 'ajuste', label: 'Ajuste Final', duracion: 60 },
  { value: 'entrega', label: 'Entrega', duracion: 60 },
]

export function duracionCita(tipo: string): number {
  return TIPOS_CITA.find((t) => t.value === tipo)?.duracion || 60
}

export function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

export function rangosSolapan(inicioA: number, finA: number, inicioB: number, finB: number): boolean {
  return inicioA < finB && inicioB < finA
}

export const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || '5491136205098'

export function waLink(mensaje: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(mensaje)}`
}
