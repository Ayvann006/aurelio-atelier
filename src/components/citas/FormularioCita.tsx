'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronLeft, Loader2, CreditCard, CheckCircle } from 'lucide-react'
import { formatFecha, formatHora, TIPOS_EVENTO, TIPOS_CITA } from '@/lib/utils'
import { toast } from 'sonner'

const schema = z.object({
  cliente_nombre: z.string().min(2, 'Nombre requerido'),
  cliente_email: z.string().email('Email inválido'),
  cliente_telefono: z.string().refine(v => v.replace(/\D/g, '').length >= 8, 'Ingresá un celular válido (mínimo 8 dígitos)'),
  tipo_evento: z.enum(['novia', 'quinceanera', 'gala', 'miss', 'otro']),
  tipo_cita: z.enum(['primera-entrevista', 'prueba', 'ajuste', 'entrega']),
  notas: z.string().optional(),
  pagar_sena: z.boolean().optional(),
})

type Form = z.infer<typeof schema>

interface Props {
  fecha: string
  hora: string
  onVolver: () => void
  onConfirmar: (cita: any, waLink?: string, emailEnviado?: boolean, linkCita?: string) => void
}

export default function FormularioCita({ fecha, hora, onVolver, onConfirmar }: Props) {
  const [cargando, setCargando] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { tipo_cita: 'primera-entrevista', tipo_evento: 'novia', pagar_sena: false }
  })
  const pagarSena = watch('pagar_sena')

  async function onSubmit(data: Form) {
    setCargando(true)
    try {
      const res = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, fecha, hora }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      if (data.pagar_sena && json.mp_url) {
        window.location.href = json.mp_url
      } else {
        onConfirmar(json.cita, json.wa_clienta, json.email_enviado, json.link_cita)
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al agendar la cita')
    } finally {
      setCargando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Resumen fecha */}
      <div className="card-dark border-dorado/20 flex items-center justify-between">
        <div>
          <p className="text-dorado text-xs tracking-widest uppercase mb-1">Tu cita</p>
          <p className="font-cormorant text-xl capitalize">{formatFecha(fecha)}</p>
          <p className="text-marfil/50 text-sm">{formatHora(hora)}</p>
        </div>
        <button type="button" onClick={onVolver} className="flex items-center gap-1 text-marfil/40 text-xs hover:text-dorado transition-colors">
          <ChevronLeft size={14} /> Cambiar
        </button>
      </div>

      {/* Tipo de cita y evento */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-marfil/40 tracking-wider uppercase block mb-2">Tipo de evento</label>
          <div className="relative">
            <select {...register('tipo_evento')} className="select-dark w-full">
              {TIPOS_EVENTO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-marfil/40 tracking-wider uppercase block mb-2">Tipo de cita</label>
          <select {...register('tipo_cita')} className="select-dark w-full">
            {TIPOS_CITA.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      {/* Datos personales */}
      <div className="space-y-4">
        <div>
          <label className="text-xs text-marfil/40 tracking-wider uppercase block mb-2">Nombre completo *</label>
          <input {...register('cliente_nombre')} placeholder="Tu nombre" className="input-dark" />
          {errors.cliente_nombre && <p className="text-red-400/80 text-xs mt-1">{errors.cliente_nombre.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-marfil/40 tracking-wider uppercase block mb-2">Email *</label>
            <input {...register('cliente_email')} type="email" placeholder="tu@email.com" className="input-dark" />
            {errors.cliente_email && <p className="text-red-400/80 text-xs mt-1">{errors.cliente_email.message}</p>}
          </div>
          <div>
            <label className="text-xs text-marfil/40 tracking-wider uppercase block mb-2">Teléfono / WhatsApp *</label>
            <input {...register('cliente_telefono')} type="tel" required placeholder="+54 9 11 ..." className="input-dark" />
            {errors.cliente_telefono && <p className="text-red-400/80 text-xs mt-1">{errors.cliente_telefono.message}</p>}
          </div>
        </div>
        <div>
          <label className="text-xs text-marfil/40 tracking-wider uppercase block mb-2">Notas adicionales</label>
          <textarea {...register('notas')} rows={3} placeholder="Contanos sobre tu evento, tu visión, colores, referencias..." className="input-dark resize-none" />
        </div>
      </div>

      {/* Seña */}
      <div className={`p-5 border transition-all ${pagarSena ? 'border-dorado/40 bg-dorado/5' : 'border-marfil/10'}`}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" {...register('pagar_sena')} className="mt-0.5 accent-dorado w-4 h-4" />
          <div>
            <p className="text-sm font-medium flex items-center gap-2">
              <CreditCard size={14} className="text-dorado" /> Abonar seña de $10.000 por MercadoPago
            </p>
            <p className="text-marfil/40 text-xs mt-1 leading-relaxed">
              Asegura tu turno. Se descuenta del total del trabajo.
            </p>
          </div>
        </label>
      </div>

      <button type="submit" disabled={cargando} className="btn-gold-fill w-full justify-center py-4 gap-2 disabled:opacity-50">
        {cargando ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
        {pagarSena ? 'Confirmar y Pagar Seña' : 'Confirmar Cita'}
      </button>

      <p className="text-center text-marfil/25 text-xs">
        Al confirmar aceptás nuestros términos. La cita no puede cancelarse automáticamente —
        contactanos por WhatsApp con 48hs de anticipación.
      </p>
    </form>
  )
}
