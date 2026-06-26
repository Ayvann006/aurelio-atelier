'use client'
import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, User, Ruler, FileText, StickyNote, Clock, Paperclip, RefreshCw, X, Plus, Star, Printer, Send, ChevronDown } from 'lucide-react'
import { formatPrecio } from '@/lib/utils'
import { toast } from 'sonner'
import type { Cliente, Medida, Presupuesto, HistorialEvento } from '@/types'
import SeccionMedidas from './SeccionMedidas'
import SeccionPresupuesto from './SeccionPresupuesto'
import SeccionNotas from './SeccionNotas'
import SeccionArchivos from './SeccionArchivos'
import TimelineProyecto from './TimelineProyecto'

const ESTADOS = [
  { key: 'consulta-inicial', label: 'Consulta inicial', color: 'text-marfil/50 bg-marfil/5 border-marfil/15' },
  { key: 'diseno', label: 'Diseño', color: 'text-blue-400/70 bg-blue-400/10 border-blue-400/20' },
  { key: 'presupuesto-enviado', label: 'Presupuesto enviado', color: 'text-yellow-400/70 bg-yellow-400/10 border-yellow-400/20' },
  { key: 'presupuesto-aprobado', label: 'Presupuesto aprobado', color: 'text-green-400/70 bg-green-400/10 border-green-400/20' },
  { key: 'en-confeccion', label: 'En confección', color: 'text-orange-400/70 bg-orange-400/10 border-orange-400/20' },
  { key: 'bordado', label: 'Bordado', color: 'text-purple-400/70 bg-purple-400/10 border-purple-400/20' },
  { key: 'primera-prueba', label: 'Primera prueba', color: 'text-pink-400/70 bg-pink-400/10 border-pink-400/20' },
  { key: 'ajustes', label: 'Ajustes', color: 'text-red-400/70 bg-red-400/10 border-red-400/20' },
  { key: 'terminado', label: 'Terminado', color: 'text-dorado bg-dorado/15 border-dorado/30' },
  { key: 'entregado', label: 'Entregado', color: 'text-green-400 bg-green-400/15 border-green-400/30' },
]

const TIPOS_VESTIDO = [
  { value: 'novia', label: 'Novia' },
  { value: 'quinceanera', label: 'Quinceañera' },
  { value: 'gala', label: 'Gala' },
  { value: 'miss', label: 'Miss / Certamen' },
  { value: 'alta-costura', label: 'Alta Costura' },
  { value: 'otro', label: 'Otro' },
]

type Tab = 'info' | 'medidas' | 'presupuesto' | 'notas' | 'archivos' | 'timeline'

interface Props {
  clienteId: string
  onVolver: () => void
  token: string
}

export default function FichaCliente({ clienteId, onVolver, token }: Props) {
  const [tab, setTab] = useState<Tab>('info')
  const [ficha, setFicha] = useState<any>(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [editando, setEditando] = useState(false)
  const [showEstados, setShowEstados] = useState(false)
  const [form, setForm] = useState<Partial<Cliente>>({})

  function authH() { return { 'Content-Type': 'application/json', 'x-admin-token': token } }

  async function cargar() {
    setCargando(true)
    try {
      const res = await fetch(`/api/admin/fichas?id=${clienteId}`, { headers: { 'x-admin-token': token } })
      const data = await res.json()
      setFicha(data)
      setForm(data.cliente)
    } finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [clienteId])

  async function guardarInfo() {
    setGuardando(true)
    try {
      const res = await fetch('/api/admin/fichas', {
        method: 'PATCH',
        headers: authH(),
        body: JSON.stringify({ id: clienteId, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFicha((f: any) => ({ ...f, cliente: data }))
      setEditando(false)
      toast.success('Ficha actualizada')
    } catch (e: any) {
      toast.error(e.message)
    } finally { setGuardando(false) }
  }

  async function cambiarEstado(estado: string) {
    setShowEstados(false)
    const res = await fetch('/api/admin/fichas', {
      method: 'PATCH',
      headers: authH(),
      body: JSON.stringify({ id: clienteId, estado_proyecto: estado }),
    })
    if (res.ok) {
      const data = await res.json()
      setFicha((f: any) => ({ ...f, cliente: data }))
      setForm((f) => ({ ...f, estado_proyecto: estado }))
      toast.success('Estado actualizado')
      await cargar()
    }
  }

  function enviarWA() {
    const c = ficha?.cliente
    if (!c) return
    const msg = `Hola ${c.nombre.split(' ')[0]}! 👋 Te escribimos desde el atelier de Aurelio Martínez. Tu proyecto está en estado: *${estadoActual?.label}*. Ante cualquier consulta, estamos a tu disposición.`
    window.open(`https://wa.me/${c.telefono?.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (cargando) return (
    <div className="flex items-center justify-center py-20">
      <RefreshCw size={20} className="text-dorado animate-spin" />
    </div>
  )

  const { cliente, medidas, presupuestos, notas, archivos, historial, citas } = ficha || {}
  const estadoActual = ESTADOS.find(e => e.key === cliente?.estado_proyecto) || ESTADOS[0]

  // Calcular pagos
  const totalPresupuestado = presupuestos?.reduce((a: number, p: Presupuesto) => p.estado !== 'rechazado' ? a + p.precio_total : a, 0) || 0
  const totalPagado = presupuestos?.reduce((a: number, p: Presupuesto) => {
    const ants = (p.anticipos as any[] || []).filter(x => x.pagado).reduce((s: number, x: any) => s + x.monto, 0)
    const cuots = (p.cuotas as any[] || []).filter(x => x.pagado).reduce((s: number, x: any) => s + x.monto, 0)
    return a + ants + cuots
  }, 0) || 0
  const saldoPendiente = totalPresupuestado - totalPagado

  const TABS = [
    { id: 'info', label: 'Información', icon: User },
    { id: 'medidas', label: 'Medidas', icon: Ruler },
    { id: 'presupuesto', label: 'Presupuesto', icon: FileText },
    { id: 'notas', label: 'Notas', icon: StickyNote },
    { id: 'archivos', label: 'Archivos', icon: Paperclip },
    { id: 'timeline', label: 'Historial', icon: Clock },
  ]

  return (
    <div className="min-h-screen bg-negro">
      {/* Header */}
      <div className="bg-negro2 border-b border-marfil/8 px-8 py-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onVolver} className="text-marfil/30 hover:text-dorado transition-colors">
              <ArrowLeft size={18} strokeWidth={1.5} />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-cormorant text-2xl italic">{cliente?.nombre}</h1>
                <div className="relative">
                  <button onClick={() => setShowEstados(!showEstados)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1 border ${estadoActual.color} transition-all`}>
                    {estadoActual.label}
                    <ChevronDown size={11} />
                  </button>
                  {showEstados && (
                    <div className="absolute left-0 top-full mt-1 bg-negro2 border border-marfil/10 z-20 min-w-[200px] shadow-xl">
                      {ESTADOS.map(e => (
                        <button key={e.key} onClick={() => cambiarEstado(e.key)}
                          className={`w-full text-left px-4 py-2.5 text-xs border-b border-marfil/5 last:border-0 transition-colors hover:bg-marfil/3 ${e.key === cliente?.estado_proyecto ? 'text-dorado' : 'text-marfil/50'}`}>
                          {e.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-marfil/40 text-xs mt-1">{cliente?.email} · {cliente?.telefono}</p>
            </div>
          </div>

          {/* KPIs rápidos */}
          <div className="flex gap-6 flex-wrap">
            <div className="text-right">
              <p className="text-xs text-marfil/30 uppercase tracking-wider">Presupuestado</p>
              <p className="font-cormorant text-xl text-dorado">{formatPrecio(totalPresupuestado)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-marfil/30 uppercase tracking-wider">Cobrado</p>
              <p className="font-cormorant text-xl text-green-400/70">{formatPrecio(totalPagado)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-marfil/30 uppercase tracking-wider">Saldo</p>
              <p className={`font-cormorant text-xl ${saldoPendiente > 0 ? 'text-red-400/70' : 'text-green-400/70'}`}>{formatPrecio(saldoPendiente)}</p>
            </div>
            <div className="flex gap-2 items-start">
              <button onClick={enviarWA} className="border border-dorado/30 text-dorado px-3 py-2 text-xs hover:bg-dorado/10 transition-all flex items-center gap-1.5">
                <Send size={12} /> WA
              </button>
              <button onClick={() => window.print()} className="border border-marfil/15 text-marfil/40 px-3 py-2 text-xs hover:border-dorado/30 hover:text-dorado transition-all flex items-center gap-1.5">
                <Printer size={12} /> Imprimir
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mt-5 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id as Tab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs border-b-2 transition-all flex-shrink-0 ${tab === id ? 'border-dorado text-dorado' : 'border-transparent text-marfil/40 hover:text-marfil/70'}`}>
              <Icon size={13} strokeWidth={1.5} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-8">

        {/* ── INFO ── */}
        {tab === 'info' && (
          <div className="max-w-3xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-cormorant text-xl italic">Información de la clienta</h2>
              {!editando
                ? <button onClick={() => setEditando(true)} className="btn-gold text-xs py-2 px-4">Editar</button>
                : <div className="flex gap-2">
                    <button onClick={guardarInfo} disabled={guardando} className="btn-gold-fill text-xs py-2 px-4 gap-1.5 flex items-center">
                      {guardando ? <RefreshCw size={12} className="animate-spin" /> : null} Guardar
                    </button>
                    <button onClick={() => setEditando(false)} className="btn-ghost text-xs py-2 px-4">Cancelar</button>
                  </div>
              }
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Datos personales */}
              <div className="card-dark md:col-span-2">
                <p className="text-xs text-dorado tracking-widest uppercase mb-4">Datos personales</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Nombre completo', field: 'nombre' },
                    { label: 'Email', field: 'email' },
                    { label: 'Teléfono / WhatsApp', field: 'telefono' },
                    { label: 'Ciudad', field: 'ciudad' },
                    { label: 'Provincia', field: 'provincia' },
                    { label: 'Código Postal', field: 'codigo_postal' },
                  ].map(({ label, field }) => (
                    <div key={field}>
                      <label className="text-xs text-marfil/30 uppercase tracking-wider block mb-1.5">{label}</label>
                      {editando
                        ? <input value={(form as any)[field] || ''} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} className="input-dark text-sm" />
                        : <p className="text-sm text-marfil/80">{(cliente as any)?.[field] || <span className="text-marfil/20 italic">Sin datos</span>}</p>
                      }
                    </div>
                  ))}
                </div>
              </div>

              {/* Proyecto */}
              <div className="card-dark md:col-span-2">
                <p className="text-xs text-dorado tracking-widest uppercase mb-4">Detalles del proyecto</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-marfil/30 uppercase tracking-wider block mb-1.5">Tipo de vestido</label>
                    {editando
                      ? <select value={form.tipo_vestido || ''} onChange={e => setForm(f => ({ ...f, tipo_vestido: e.target.value as any }))} className="select-dark w-full text-sm">
                          <option value="">Seleccionar</option>
                          {TIPOS_VESTIDO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      : <p className="text-sm text-marfil/80">{TIPOS_VESTIDO.find(t => t.value === cliente?.tipo_vestido)?.label || <span className="text-marfil/20 italic">Sin datos</span>}</p>
                    }
                  </div>
                  <div>
                    <label className="text-xs text-marfil/30 uppercase tracking-wider block mb-1.5">Color del vestido</label>
                    {editando
                      ? <input value={form.color_vestido || ''} onChange={e => setForm(f => ({ ...f, color_vestido: e.target.value }))} className="input-dark text-sm" placeholder="Ej: Blanco marfil" />
                      : <p className="text-sm text-marfil/80">{cliente?.color_vestido || <span className="text-marfil/20 italic">Sin datos</span>}</p>
                    }
                  </div>
                  <div>
                    <label className="text-xs text-marfil/30 uppercase tracking-wider block mb-1.5">Fecha de entrega</label>
                    {editando
                      ? <input type="date" value={form.fecha_entrega || ''} onChange={e => setForm(f => ({ ...f, fecha_entrega: e.target.value }))} className="input-dark text-sm" />
                      : <p className="text-sm text-marfil/80">{cliente?.fecha_entrega || <span className="text-marfil/20 italic">Sin fecha</span>}</p>
                    }
                  </div>
                </div>
              </div>

              {/* Citas */}
              <div className="card-dark md:col-span-2">
                <p className="text-xs text-dorado tracking-widest uppercase mb-4">Historial de citas ({citas?.length || 0})</p>
                {citas?.length === 0
                  ? <p className="text-marfil/20 text-sm">Sin citas registradas</p>
                  : <div className="space-y-2">
                      {citas?.map((c: any) => (
                        <div key={c.id} className="flex items-center justify-between py-2 border-b border-marfil/5">
                          <div>
                            <p className="text-sm capitalize">{c.tipo_cita?.replace('-', ' ')}</p>
                            <p className="text-marfil/30 text-xs">{c.fecha} · {c.hora?.substring(0,5)} hs</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 border ${c.estado === 'confirmada' ? 'border-dorado/30 text-dorado' : c.estado === 'completada' ? 'border-green-400/30 text-green-400/70' : 'border-red-400/20 text-red-400/50'}`}>
                            {c.estado}
                          </span>
                        </div>
                      ))}
                    </div>
                }
              </div>
            </div>
          </div>
        )}

        {tab === 'medidas' && (
          <SeccionMedidas clienteId={clienteId} medidas={ficha?.medidas || []} token={token} onActualizar={cargar} />
        )}
        {tab === 'presupuesto' && (
          <SeccionPresupuesto clienteId={clienteId} cliente={cliente} presupuestos={ficha?.presupuestos || []} token={token} onActualizar={cargar} />
        )}
        {tab === 'notas' && (
          <SeccionNotas clienteId={clienteId} notas={ficha?.notas || []} token={token} onActualizar={cargar} />
        )}
        {tab === 'archivos' && (
          <SeccionArchivos clienteId={clienteId} archivos={ficha?.archivos || []} token={token} onActualizar={cargar} />
        )}
        {tab === 'timeline' && (
          <TimelineProyecto historial={ficha?.historial || []} />
        )}
      </div>
    </div>
  )
}
