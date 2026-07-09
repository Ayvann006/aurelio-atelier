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

export const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || '5491136205098'

export function waLink(mensaje: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(mensaje)}`
}
