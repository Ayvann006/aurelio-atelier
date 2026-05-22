'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChevronLeft, Save, Printer, ChevronDown, ChevronUp,
  Plus, Trash2, Star, FileText, Camera, Ruler, 
  DollarSign, Clock, CheckCircle, AlertCircle, Loader2,
  MessageCircle, Mail, Download, Upload
} from 'lucide-react'
import { formatPrecio } from '@/lib/utils'
import { toast } from 'sonner'

const ESTADOS_PROYECTO = [
  { key: 'consulta-inicial', label: 'Consulta inicial', color: 'text-marfil/40 bg-marfil/5 border-marfil/15' },
  { key: 'diseño', label: 'Diseño', color: 'text-blue-400/70 bg-blue-400/10 border-blue-400/20' },
  { key: 'presupuesto-enviado', label: 'Presupuesto enviado', color: 'text-yellow-400/70 bg-yellow-400/10 border-yellow-400/20' },
  { key: 'presupuesto-aprobado', label: 'Presupuesto aprobado', color: 'text-dorado bg-dorado/10 border-dorado/25' },
  { key: 'en-confeccion', label: 'En confección', color: 'text-orange-400/70 bg-orange-400/10 border-orange-400/20' },
  { key: 'bordado', label: 'Bordado', color: 'text-purple-400/70 bg-purple-400/10 border-purple-400/20' },
  { key: 'primera-prueba', label: 'Primera prueba', color: 'text-pink-400/70 bg-pink-400/10 border-pink-400/20' },
  { key: 'ajustes', label: 'Ajustes', color: 'text-red-400/70 bg-red-400/10 border-red-400/20' },
  { key: 'terminado', label: 'Terminado', color: 'text-teal-400/70 bg-teal-400/10 border-teal-400/20' },
  { key: 'entregado', label: 'Entregado', color: 'text-green-400/80 bg-green-400/10 border-green-400/25' },
]

const MEDIDAS_FRENTE = [
  { key: 'sobre_busto', label: 'Sobre busto', flecha: 'text-rose-300' },
  { key: 'busto', label: 'Busto', flecha: 'text-pink-400' },
  { key: 'bajo_busto', label: 'Bajo busto', flecha: 'text-red-400' },
  { key: 'escote', label: 'Escote', flecha: 'text-fuchsia-400' },
  { key: 'cintura', label: 'Cintura', flecha: 'text-orange-400' },
  { key: 'cadera_alta', label: 'Cadera alta', flecha: 'text-amber-400' },
  { key: 'cadera', label: 'Cadera', flecha: 'text-dorado' },
  { key: 'cadera_baja', label: 'Cadera baja', flecha: 'text-yellow-600' },
  { key: 'largo_corpino_lateral', label: 'Largo corpiño lateral', flecha: 'text-lime-400' },
  { key: 'largo_delantero', label: 'Largo delantero', flecha: 'text-green-400' },
  { key: 'largo_total', label: 'Largo total', flecha: 'text-teal-400' },
  { key: 'hombros', label: 'Hombros', flecha: 'text-blue-400' },
  { key: 'sisa', label: 'Sisa', flecha: 'text-purple-400' },
]

const MEDIDAS_ESPALDA = [
  { key: 'largo_espalda', label: 'Largo espalda', flecha: 'text-pink-400' },
  { key: 'ancho_espalda', label: 'Ancho espalda', flecha: 'text-orange-400' },
  { key: 'talle', label: 'Talle', flecha: 'text-dorado' },
]

const MEDIDAS_BRAZO = [
  { key: 'brazo', label: 'Largo brazo', flecha: 'text-pink-400' },
  { key: 'largo_manga', label: 'Largo manga', flecha: 'text-orange-400' },
  { key: 'biceps', label: 'Bíceps', flecha: 'text-dorado' },
  { key: 'codo', label: 'Codo', flecha: 'text-orange-300' },
  { key: 'muneca', label: 'Muñeca', flecha: 'text-green-400' },
]

const MEDIDAS_FALDA = [
  { key: 'tiro', label: 'Tiro', flecha: 'text-blue-400' },
  { key: 'sobre_rodilla', label: 'Sobre rodilla', flecha: 'text-indigo-400' },
  { key: 'largo_falda', label: 'Largo falda', flecha: 'text-purple-400' },
  { key: 'altura', label: 'Altura total', flecha: 'text-teal-400' },
  { key: 'taco_zapato', label: 'Taco del zapato', flecha: 'text-red-400' },
]

interface Props {
  clienteId: string
  token: string
}

export default function FichaClientaPage({ clienteId, token }: Props) {
  const router = useRouter()
  const [cliente, setCliente] = useState<any>(null)
  const [ficha, setFicha] = useState<any>({})
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [seccionAbierta, setSeccionAbierta] = useState<string>('datos')
  const [notaNueva, setNotaNueva] = useState('')
  const [subiendoFoto, setSubiendoFoto] = useState<string | null>(null)

  // Presupuesto
  const [moneda, setMoneda] = useState<'ARS' | 'USD'>('ARS')
  const USD_RATE = 1200 // Actualizar manualmente o conectar a API
  const [prespItems, setPrespItems] = useState<any[]>([])
  const [prespTotal, setPrespTotal] = useState('')
  const [prespDescripcion, setPrespDescripcion] = useState('')
  const [prespEstado, setPrespEstado] = useState('pendiente')
  const [prespAnticipo, setPrespAnticipo] = useState('')
  const [prespCuotas, setPrespCuotas] = useState('')
  const [prespFechaPago, setPrespFechaPago] = useState('')

  // Nueva cita desde ficha
  const [modalCita, setModalCita] = useState(false)
  const [nuevaCita, setNuevaCita] = useState({ fecha: '', hora: '', tipo_cita: 'prueba', tipo_evento: 'novia', notas: '' })
  const [agendandoCita, setAgendandoCita] = useState(false)
  const [horasDisp, setHorasDisp] = useState<string[]>([])

  async function cargarHoras(fecha: string) {
    if (!fecha) return
    const res = await fetch(`/api/disponibilidad?fecha=${fecha}`)
    const data = await res.json()
    setHorasDisp(data.disponibles || [])
  }

  async function agendarCita() {
    if (!nuevaCita.fecha || !nuevaCita.hora) { toast.error('Completá fecha y hora'); return }
    setAgendandoCita(true)
    try {
      const res = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nuevaCita,
          cliente_nombre: cliente.nombre,
          cliente_email: cliente.email,
          cliente_telefono: cliente.telefono,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Cita agendada correctamente')
      setModalCita(false)
      setNuevaCita({ fecha: '', hora: '', tipo_cita: 'prueba', tipo_evento: 'novia', notas: '' })
    } catch (e: any) {
      toast.error(e.message)
    } finally { setAgendandoCita(false) }
  }

  function headers() {
    return { 'Content-Type': 'application/json', 'x-admin-token': token }
  }

  useEffect(() => {
    cargarDatos()
  }, [clienteId])

  async function cargarDatos() {
    setCargando(true)
    try {
      const [clRes, fichaRes] = await Promise.all([
        fetch(`/api/admin/clientes?id=${clienteId}`, { headers: { 'x-admin-token': token } }),
        fetch(`/api/admin/fichas?cliente_id=${clienteId}`, { headers: { 'x-admin-token': token } }),
      ])
      const cl = await clRes.json()
      const fi = await fichaRes.json()
      setCliente(cl)
      if (fi) {
        setFicha(fi)
        if (fi.presupuesto) {
          setPrespDescripcion(fi.presupuesto.descripcion || '')
          setPrespTotal(String(fi.presupuesto.total || ''))
          setPrespEstado(fi.presupuesto.estado || 'pendiente')
          setPrespAnticipo(String(fi.presupuesto.anticipo || ''))
          setPrespCuotas(String(fi.presupuesto.cuotas || ''))
          setPrespFechaPago(fi.presupuesto.fecha_pago || '')
          setPrespItems(fi.presupuesto.items || [])
        }
      }
    } finally { setCargando(false) }
  }

  async function guardar() {
    setGuardando(true)
    try {
      const presupuesto = prespTotal ? {
        descripcion: prespDescripcion,
        total: parseFloat(prespTotal) || 0,
        anticipo: parseFloat(prespAnticipo) || 0,
        cuotas: parseInt(prespCuotas) || 1,
        fecha_pago: prespFechaPago,
        estado: prespEstado,
        items: prespItems,
      } : ficha.presupuesto

      const res = await fetch('/api/admin/fichas', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          ...ficha,
          cliente_id: clienteId,
          presupuesto,
        }),
      })
      if (!res.ok) throw new Error('Error al guardar')
      const data = await res.json()
      setFicha(data)
      toast.success('Ficha guardada correctamente')
    } catch (e: any) {
      toast.error(e.message)
    } finally { setGuardando(false) }
  }

  async function cambiarEstado(nuevoEstado: string) {
    const nuevaFicha = { ...ficha, estado_proyecto: nuevoEstado }
    // Agregar al timeline
    const evento = {
      fecha: new Date().toISOString(),
      estado: nuevoEstado,
      label: ESTADOS_PROYECTO.find(e => e.key === nuevoEstado)?.label,
    }
    nuevaFicha.timeline = [...(ficha.timeline || []), evento]
    setFicha(nuevaFicha)
    
    const res = await fetch('/api/admin/fichas', {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ ...nuevaFicha, cliente_id: clienteId }),
    })
    if (res.ok) toast.success('Estado actualizado')
  }

  function setMedida(key: string, val: string) {
    setFicha((f: any) => ({ ...f, [key]: val === '' ? null : parseFloat(val) }))
  }

  function agregarNota() {
    if (!notaNueva.trim()) return
    const nota = {
      id: Date.now(),
      texto: notaNueva,
      fecha: new Date().toISOString(),
      importante: false,
    }
    setFicha((f: any) => ({ ...f, notas: [...(f.notas || []), nota] }))
    setNotaNueva('')
  }

  function toggleNotaImportante(id: number) {
    setFicha((f: any) => ({
      ...f,
      notas: f.notas.map((n: any) => n.id === id ? { ...n, importante: !n.importante } : n)
    }))
  }

  function eliminarNota(id: number) {
    setFicha((f: any) => ({ ...f, notas: f.notas.filter((n: any) => n.id !== id) }))
  }

  async function subirFotoSeccion(seccion: string, file: File) {
    setSubiendoFoto(seccion)
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      const res = await fetch('/api/admin/upload', {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ base64: reader.result, nombre: file.name }),
      })
      const json = await res.json()
      if (res.ok && json.url) {
        setFicha((f: any) => ({ ...f, [seccion]: [...(f[seccion] || []), json.url] }))
        toast.success('Foto subida')
      } else toast.error('Error al subir')
      setSubiendoFoto(null)
    }
  }

  function enviarPorWA() {
    if (!cliente) return
    const estado = ESTADOS_PROYECTO.find(e => e.key === ficha.estado_proyecto)?.label || ''
    const msg = `🌹 *Aurelio Martínez Atelier*\n\nHola ${cliente.nombre}!\n\n` +
      `Estado de tu proyecto: *${estado}*\n` +
      (prespTotal ? `Presupuesto: *${formatPrecio(parseFloat(prespTotal))}*\n` : '') +
      (ficha.fecha_entrega ? `Fecha de entrega: *${ficha.fecha_entrega}*\n` : '') +
      `\nCualquier consulta estamos disponibles. 💛`
    window.open(`https://wa.me/${cliente.telefono?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  function imprimirFicha() { window.print() }

  const estadoActual = ESTADOS_PROYECTO.find(e => e.key === ficha.estado_proyecto)
  const totalPagado = (ficha.pagos || []).reduce((a: number, p: any) => a + (p.monto || 0), 0)
  const saldoPendiente = prespTotal ? parseFloat(prespTotal) - totalPagado : 0

  if (cargando) return (
    <div className="min-h-screen bg-negro flex items-center justify-center">
      <Loader2 size={24} className="text-dorado animate-spin" />
    </div>
  )

  if (!cliente) return (
    <div className="min-h-screen bg-negro flex items-center justify-center">
      <p className="text-marfil/40">Clienta no encontrada</p>
    </div>
  )

  function Seccion({ id, titulo, icono: Icono, children }: any) {
    const abierta = seccionAbierta === id
    return (
      <div className="border border-marfil/8 print:border-marfil/20">
        <button onClick={() => setSeccionAbierta(abierta ? '' : id)}
          className="w-full flex items-center justify-between px-6 py-4 bg-negro2 hover:bg-negro3 transition-colors print:hidden">
          <div className="flex items-center gap-3">
            <Icono size={15} className="text-dorado" strokeWidth={1.5} />
            <span className="text-sm font-medium tracking-wider uppercase">{titulo}</span>
          </div>
          {abierta ? <ChevronUp size={14} className="text-marfil/30" /> : <ChevronDown size={14} className="text-marfil/30" />}
        </button>
        <div className={`${abierta ? 'block' : 'hidden'} print:block`}>
          <div className="p-6">{children}</div>
        </div>
      </div>
    )
  }

  function CampoMedida({ campo }: { campo: { key: string; label: string; flecha: string } }) {
    return (
      <div className="flex items-center gap-3">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${campo.flecha.replace('text-', 'bg-')}`} />
        <span className="text-marfil/50 text-xs flex-1">{campo.label}</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            step="0.5"
            value={ficha[campo.key] || ''}
            onChange={e => setMedida(campo.key, e.target.value)}
            className="w-16 bg-negro3 border border-marfil/10 text-marfil text-xs px-2 py-1.5 text-center focus:outline-none focus:border-dorado/40 print:border-marfil/30"
            placeholder="—"
          />
          <span className="text-marfil/25 text-xs">cm</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-negro">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-negro2 border-b border-marfil/8 px-6 py-3 flex items-center justify-between print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-marfil/40 hover:text-marfil transition-colors text-sm">
          <ChevronLeft size={16} /> Volver
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => setModalCita(true)} className="flex items-center gap-2 text-dorado/60 hover:text-dorado transition-colors text-xs border border-dorado/20 px-3 py-1.5">
            <Plus size={13} /> Nueva cita
          </button>
          <button onClick={enviarPorWA} className="flex items-center gap-2 text-marfil/40 hover:text-green-400 transition-colors text-xs border border-marfil/10 px-3 py-1.5">
            <MessageCircle size={13} /> WhatsApp
          </button>
          <button onClick={imprimirFicha} className="flex items-center gap-2 text-marfil/40 hover:text-marfil transition-colors text-xs border border-marfil/10 px-3 py-1.5">
            <Printer size={13} /> Imprimir
          </button>
          <button onClick={guardar} disabled={guardando}
            className="btn-gold-fill flex items-center gap-2 py-1.5 px-4 text-xs disabled:opacity-50">
            {guardando ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            Guardar
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">

        {/* Header ficha */}
        <div className="card-dark">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-dorado text-xs tracking-widest uppercase mb-1">Ficha de Clienta</p>
              <h1 className="font-cormorant text-3xl italic font-light">{cliente.nombre}</h1>
              <div className="flex flex-wrap gap-4 mt-2">
                <a href={`https://wa.me/${cliente.telefono?.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                  className="text-marfil/50 text-sm hover:text-dorado transition-colors flex items-center gap-1">
                  <MessageCircle size={12} /> {cliente.telefono}
                </a>
                <span className="text-marfil/50 text-sm">{cliente.email}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <select
                value={ficha.estado_proyecto || 'consulta-inicial'}
                onChange={e => cambiarEstado(e.target.value)}
                className="select-dark text-xs py-1.5 pr-8"
              >
                {ESTADOS_PROYECTO.map(e => (
                  <option key={e.key} value={e.key}>{e.label}</option>
                ))}
              </select>
              {estadoActual && (
                <span className={`text-xs px-3 py-1 border ${estadoActual.color}`}>{estadoActual.label}</span>
              )}
            </div>
          </div>

          {/* Barra de progreso del proyecto */}
          <div className="mt-5 pt-5 border-t border-marfil/8">
            <div className="flex gap-0 overflow-x-auto">
              {ESTADOS_PROYECTO.map((e, i) => {
                const estados = ESTADOS_PROYECTO.map(x => x.key)
                const posActual = estados.indexOf(ficha.estado_proyecto || 'consulta-inicial')
                const posEste = i
                const completado = posEste < posActual
                const activo = e.key === (ficha.estado_proyecto || 'consulta-inicial')
                return (
                  <div key={e.key} className="flex flex-col items-center flex-1 min-w-0">
                    <div className={`h-1 w-full ${completado ? 'bg-dorado' : activo ? 'bg-dorado/50' : 'bg-marfil/8'}`} />
                    <p className={`text-xs mt-1.5 text-center px-1 truncate w-full ${activo ? 'text-dorado' : completado ? 'text-marfil/40' : 'text-marfil/15'}`}
                      style={{fontSize:'9px'}}>
                      {e.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Datos rápidos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-marfil/8">
            <div>
              <label className="text-xs text-marfil/30 uppercase tracking-wider block mb-1.5">Tipo de vestido</label>
              <select value={ficha.tipo_vestido || ''} onChange={e => setFicha((f:any)=>({...f,tipo_vestido:e.target.value}))} className="select-dark w-full text-xs py-1.5">
                <option value="">Seleccionar</option>
                {['novia','15años','gala','reina','alta costura'].map(t=><option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-marfil/30 uppercase tracking-wider block mb-1.5">Color</label>
              <input value={ficha.color_vestido || ''} onChange={e => setFicha((f:any)=>({...f,color_vestido:e.target.value}))} className="input-dark text-xs py-1.5" placeholder="Ej: Blanco marfil" />
            </div>
            <div>
              <label className="text-xs text-marfil/30 uppercase tracking-wider block mb-1.5">Fecha de entrega</label>
              <input type="date" value={ficha.fecha_entrega || ''} onChange={e => setFicha((f:any)=>({...f,fecha_entrega:e.target.value}))} className="input-dark text-xs py-1.5" />
            </div>
            <div>
              <label className="text-xs text-marfil/30 uppercase tracking-wider block mb-1.5">Saldo pendiente</label>
              <p className={`font-cormorant text-xl ${saldoPendiente > 0 ? 'text-dorado' : 'text-green-400/70'}`}>
                {prespTotal ? formatPrecio(saldoPendiente) : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* MEDIDAS */}
        <Seccion id="medidas" titulo="Medidas de la clienta" icono={Ruler}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Silueta frontal SVG simplificada */}
            <div>
              <p className="text-dorado text-xs tracking-widest uppercase mb-4">Vista Frontal & Largo</p>
              <div className="relative bg-negro3 border border-marfil/5 p-4 flex justify-center mb-4">
                <svg viewBox="0 0 200 420" className="w-40 opacity-60" fill="none" stroke="#F5F0E8" strokeWidth="1">
                  {/* Cabeza */}
                  <ellipse cx="100" cy="35" rx="22" ry="28" />
                  {/* Cuello */}
                  <line x1="90" y1="63" x2="87" y2="75" />
                  <line x1="110" y1="63" x2="113" y2="75" />
                  {/* Hombros */}
                  <path d="M87,75 Q60,80 50,95" />
                  <path d="M113,75 Q140,80 150,95" />
                  {/* Busto */}
                  <path d="M50,95 Q48,110 52,120" />
                  <path d="M150,95 Q152,110 148,120" />
                  <path d="M52,120 Q75,125 100,123 Q125,125 148,120" />
                  {/* Cintura */}
                  <path d="M55,150 Q75,155 100,153 Q125,155 145,150" />
                  {/* Cadera */}
                  <path d="M50,180 Q75,185 100,183 Q125,185 150,180" />
                  {/* Laterales */}
                  <line x1="52" y1="120" x2="55" y2="150" />
                  <line x1="148" y1="120" x2="145" y2="150" />
                  <line x1="55" y1="150" x2="50" y2="180" />
                  <line x1="145" y1="150" x2="150" y2="180" />
                  {/* Piernas */}
                  <path d="M50,180 Q48,220 52,280 Q55,330 58,390" />
                  <path d="M150,180 Q152,220 148,280 Q145,330 142,390" />
                  <path d="M52,280 Q75,290 100,288" />
                  <path d="M148,280 Q125,290 100,288" />
                  {/* Brazos */}
                  <path d="M50,95 Q35,130 32,180 Q30,200 34,220" />
                  <path d="M150,95 Q165,130 168,180 Q170,200 166,220" />
                  {/* Pies */}
                  <ellipse cx="60" cy="395" rx="12" ry="5" />
                  <ellipse cx="140" cy="395" rx="12" ry="5" />
                </svg>
              </div>
              <div className="space-y-2.5">
                {MEDIDAS_FRENTE.map(m => <CampoMedida key={m.key} campo={m} />)}
              </div>
            </div>

            <div className="space-y-6">
              {/* Espalda */}
              <div>
                <p className="text-dorado text-xs tracking-widest uppercase mb-3">Espalda</p>
                <div className="space-y-2.5">
                  {MEDIDAS_ESPALDA.map(m => <CampoMedida key={m.key} campo={m} />)}
                </div>
              </div>
              {/* Brazo */}
              <div>
                <p className="text-dorado text-xs tracking-widest uppercase mb-3">Brazo</p>
                <div className="space-y-2.5">
                  {MEDIDAS_BRAZO.map(m => <CampoMedida key={m.key} campo={m} />)}
                </div>
              </div>
              {/* Falda */}
              <div>
                <p className="text-dorado text-xs tracking-widest uppercase mb-3">Falda & Largo</p>
                <div className="space-y-2.5">
                  {MEDIDAS_FALDA.map(m => <CampoMedida key={m.key} campo={m} />)}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-marfil/8">
            <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Notas de medidas</label>
            <textarea value={ficha.notas_medidas || ''} onChange={e => setFicha((f:any)=>({...f,notas_medidas:e.target.value}))}
              className="input-dark w-full resize-none" rows={2} placeholder="Observaciones sobre las medidas, postura, particularidades..." />
          </div>
        </Seccion>

        {/* PRESUPUESTO */}
        <Seccion id="presupuesto" titulo="Presupuesto" icono={DollarSign}>
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Descripción del diseño</label>
                <textarea value={prespDescripcion} onChange={e => setPrespDescripcion(e.target.value)}
                  className="input-dark w-full resize-none" rows={3} placeholder="Describe el diseño, materiales, detalles especiales..." />
              </div>
              <div>
                <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Precio total</label>
                <div className="flex gap-2">
                  <input type="number" value={prespTotal} onChange={e => setPrespTotal(e.target.value)}
                    className="input-dark flex-1" placeholder="0" />
                  <div className="flex border border-marfil/10">
                    {(['ARS','USD'] as const).map(m => (
                      <button key={m} onClick={() => setMoneda(m)}
                        className={`px-3 text-xs transition-all ${moneda === m ? 'bg-dorado/15 text-dorado' : 'text-marfil/30 hover:text-dorado'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                {prespTotal && moneda === 'USD' && (
                  <p className="text-marfil/25 text-xs mt-1">≈ {new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',minimumFractionDigits:0}).format(parseFloat(prespTotal)*USD_RATE)} ARS</p>
                )}
                {prespTotal && moneda === 'ARS' && (
                  <p className="text-marfil/25 text-xs mt-1">≈ USD {(parseFloat(prespTotal)/USD_RATE).toFixed(0)}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Estado</label>
                <select value={prespEstado} onChange={e => setPrespEstado(e.target.value)} className="select-dark w-full">
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="rechazado">Rechazado</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Anticipo</label>
                <input type="number" value={prespAnticipo} onChange={e => setPrespAnticipo(e.target.value)}
                  className="input-dark" placeholder="0" />
              </div>
              <div>
                <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Cuotas</label>
                <input type="number" value={prespCuotas} onChange={e => setPrespCuotas(e.target.value)}
                  className="input-dark" placeholder="1" />
              </div>
              <div>
                <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Fecha de pago</label>
                <input type="date" value={prespFechaPago} onChange={e => setPrespFechaPago(e.target.value)}
                  className="input-dark" />
              </div>
              <div>
                <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Saldo pendiente</label>
                <p className="font-cormorant text-2xl text-dorado pt-2">
                  {prespTotal ? formatPrecio(parseFloat(prespTotal) - parseFloat(prespAnticipo || '0')) : '—'}
                </p>
              </div>
            </div>

            {/* Resumen presupuesto */}
            {prespTotal && (
              <div className="bg-negro3 border border-dorado/15 p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-cormorant text-lg italic text-dorado">Aurelio Martínez Atelier</p>
                  <span className={`text-xs px-3 py-1 border ${
                    prespEstado === 'aprobado' ? 'border-green-400/30 text-green-400/70' :
                    prespEstado === 'rechazado' ? 'border-red-400/30 text-red-400/70' :
                    'border-dorado/30 text-dorado/70'
                  }`}>{prespEstado.toUpperCase()}</span>
                </div>
                <p className="text-marfil/60 text-sm mb-4">{prespDescripcion}</p>
                <div className="space-y-1.5 border-t border-marfil/8 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-marfil/50">Total</span>
                    <span className="font-cormorant text-xl">
                      {moneda === 'USD' ? `USD ${parseFloat(prespTotal).toLocaleString()}` : formatPrecio(parseFloat(prespTotal))}
                    </span>
                  </div>
                  {prespAnticipo && <div className="flex justify-between text-sm"><span className="text-marfil/50">Anticipo</span><span className="text-dorado">{formatPrecio(parseFloat(prespAnticipo))}</span></div>}
                  {prespAnticipo && <div className="flex justify-between text-sm font-medium"><span>Saldo</span><span className="text-dorado">{formatPrecio(parseFloat(prespTotal) - parseFloat(prespAnticipo))}</span></div>}
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={enviarPorWA} className="btn-gold flex-1 justify-center py-2 text-xs flex items-center gap-2">
                    <MessageCircle size={12} /> Enviar por WhatsApp
                  </button>
                  <button onClick={() => toast.info('PDF disponible después del deploy en Vercel')}
                    className="btn-ghost flex-1 justify-center py-2 text-xs flex items-center gap-2">
                    <Download size={12} /> Exportar PDF
                  </button>
                </div>
              </div>
            )}

            {/* Pagos registrados */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-marfil/40 uppercase tracking-wider">Pagos recibidos</p>
                <button onClick={() => {
                  const monto = prompt('Monto del pago:')
                  if (!monto) return
                  const pago = { id: Date.now(), monto: parseFloat(monto), fecha: new Date().toISOString().split('T')[0], descripcion: 'Pago' }
                  setFicha((f:any) => ({ ...f, pagos: [...(f.pagos || []), pago] }))
                }} className="text-xs text-dorado border border-dorado/20 px-3 py-1 hover:bg-dorado/10 transition-all flex items-center gap-1">
                  <Plus size={10} /> Agregar pago
                </button>
              </div>
              <div className="space-y-1.5">
                {(ficha.pagos || []).map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between bg-negro3 px-4 py-2.5">
                    <div>
                      <p className="text-sm">{p.descripcion}</p>
                      <p className="text-marfil/30 text-xs">{p.fecha}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-dorado font-cormorant text-lg">{formatPrecio(p.monto)}</p>
                      <button onClick={() => setFicha((f:any)=>({...f, pagos: f.pagos.filter((x:any)=>x.id!==p.id)}))}
                        className="text-marfil/20 hover:text-red-400/60 transition-colors"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
                {(ficha.pagos || []).length === 0 && <p className="text-marfil/20 text-xs py-3 text-center">Sin pagos registrados</p>}
              </div>
              {(ficha.pagos || []).length > 0 && prespTotal && (
                <div className="flex justify-between mt-3 pt-3 border-t border-marfil/8">
                  <span className="text-sm text-marfil/50">Total cobrado</span>
                  <span className="font-cormorant text-xl">{formatPrecio(totalPagado)}</span>
                </div>
              )}
            </div>
          </div>
        </Seccion>

        {/* NOTAS */}
        <Seccion id="notas" titulo="Notas del proyecto" icono={FileText}>
          <div className="space-y-4">
            <div className="flex gap-3">
              <textarea value={notaNueva} onChange={e => setNotaNueva(e.target.value)}
                className="input-dark flex-1 resize-none" rows={2}
                placeholder="Observaciones, cambios, preferencias de la clienta, detalles técnicos..."
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) agregarNota() }} />
              <button onClick={agregarNota} className="btn-gold px-4 self-start mt-0 text-xs flex items-center gap-1">
                <Plus size={13} /> Agregar
              </button>
            </div>
            <div className="space-y-2">
              {[...(ficha.notas || [])].reverse().map((n: any) => (
                <div key={n.id} className={`p-4 border ${n.importante ? 'border-dorado/30 bg-dorado/5' : 'border-marfil/8 bg-negro3'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-marfil/80 leading-relaxed flex-1">{n.texto}</p>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => toggleNotaImportante(n.id)}
                        className={`transition-colors ${n.importante ? 'text-dorado' : 'text-marfil/20 hover:text-dorado'}`}>
                        <Star size={13} fill={n.importante ? 'currentColor' : 'none'} />
                      </button>
                      <button onClick={() => eliminarNota(n.id)} className="text-marfil/20 hover:text-red-400/60 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="text-marfil/25 text-xs mt-2">{new Date(n.fecha).toLocaleDateString('es-AR', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
                </div>
              ))}
              {(ficha.notas || []).length === 0 && <p className="text-marfil/20 text-xs text-center py-4">Sin notas aún</p>}
            </div>
          </div>
        </Seccion>

        {/* FOTOS Y BOCETOS */}
        <Seccion id="fotos" titulo="Fotos, bocetos y referencias" icono={Camera}>
          {[
            { key: 'fotos_referencia', label: 'Fotos de referencia' },
            { key: 'bocetos', label: 'Bocetos del diseño' },
            { key: 'fotos_prueba', label: 'Fotos de prueba' },
          ].map(({ key, label }) => (
            <div key={key} className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-marfil/40 uppercase tracking-wider">{label}</p>
                <label className={`text-xs border px-3 py-1 cursor-pointer transition-all flex items-center gap-1 ${subiendoFoto === key ? 'border-dorado/40 text-dorado' : 'border-marfil/10 text-marfil/40 hover:border-dorado/30 hover:text-dorado'}`}>
                  {subiendoFoto === key ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                  Subir foto
                  <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) subirFotoSeccion(key, e.target.files[0]); e.target.value='' }} />
                </label>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {(ficha[key] || []).map((url: string, i: number) => (
                  <div key={i} className="relative group aspect-square">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setFicha((f:any) => ({ ...f, [key]: f[key].filter((_:any, j:number) => j !== i) }))}
                      className="absolute top-1 right-1 bg-negro/80 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5">
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
                {(ficha[key] || []).length === 0 && (
                  <div className="aspect-square border border-dashed border-marfil/10 flex items-center justify-center">
                    <Camera size={18} className="text-marfil/15" strokeWidth={0.5} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </Seccion>

        {/* TIMELINE */}
        <Seccion id="timeline" titulo="Historial del proyecto" icono={Clock}>
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-marfil/8" />
            <div className="space-y-4">
              {[...(ficha.timeline || [])].reverse().map((e: any, i: number) => {
                const est = ESTADOS_PROYECTO.find(x => x.key === e.estado)
                return (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-6 h-6 border border-dorado/30 bg-negro flex items-center justify-center flex-shrink-0 z-10">
                      <CheckCircle size={12} className="text-dorado" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm">{est?.label || e.estado}</p>
                      <p className="text-marfil/30 text-xs">{new Date(e.fecha).toLocaleDateString('es-AR', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
                    </div>
                  </div>
                )
              })}
              {(ficha.timeline || []).length === 0 && (
                <p className="text-marfil/20 text-xs pl-8">El historial aparecerá a medida que avance el proyecto</p>
              )}
            </div>
          </div>
        </Seccion>

        <div className="flex justify-end pb-8">
          <button onClick={guardar} disabled={guardando} className="btn-gold-fill flex items-center gap-2 px-8 py-3 disabled:opacity-50">
            {guardando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Guardar toda la ficha
          </button>
        </div>

      </div>

      {/* Modal nueva cita */}
      {modalCita && (
        <div className="fixed inset-0 z-50 bg-negro/90 flex items-center justify-center p-6" style={{backdropFilter:'blur(8px)'}}>
          <div className="bg-negro2 border border-marfil/10 max-w-md w-full p-8">
            <h2 className="font-cormorant text-2xl italic mb-6">Nueva cita — {cliente?.nombre}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Tipo de cita</label>
                  <select value={nuevaCita.tipo_cita} onChange={e => setNuevaCita(n=>({...n,tipo_cita:e.target.value}))} className="select-dark w-full">
                    <option value="primera-entrevista">Primera entrevista</option>
                    <option value="prueba">Prueba</option>
                    <option value="ajuste">Ajuste</option>
                    <option value="entrega">Entrega</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Tipo de evento</label>
                  <select value={nuevaCita.tipo_evento} onChange={e => setNuevaCita(n=>({...n,tipo_evento:e.target.value}))} className="select-dark w-full">
                    <option value="novia">Novia</option>
                    <option value="quinceanera">Quinceañera</option>
                    <option value="gala">Gala</option>
                    <option value="miss">Miss</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Fecha</label>
                <input type="date" value={nuevaCita.fecha} onChange={e => { setNuevaCita(n=>({...n,fecha:e.target.value,hora:''})); cargarHoras(e.target.value) }} className="input-dark w-full" />
              </div>
              {horasDisp.length > 0 && (
                <div>
                  <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Horario disponible</label>
                  <div className="grid grid-cols-4 gap-2">
                    {horasDisp.map(h => (
                      <button key={h} onClick={() => setNuevaCita(n=>({...n,hora:h}))}
                        className={`py-2 text-xs border transition-all ${nuevaCita.hora===h ? 'border-dorado bg-dorado/10 text-dorado' : 'border-marfil/10 text-marfil/50 hover:border-dorado/30'}`}>
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Notas</label>
                <textarea value={nuevaCita.notas} onChange={e => setNuevaCita(n=>({...n,notas:e.target.value}))} className="input-dark w-full resize-none" rows={2} placeholder="Instrucciones especiales..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalCita(false)} className="btn-ghost flex-1 justify-center py-2.5 text-xs">Cancelar</button>
              <button onClick={agendarCita} disabled={agendandoCita} className="btn-gold-fill flex-1 justify-center py-2.5 text-xs gap-2 disabled:opacity-50">
                {agendandoCita ? <Loader2 size={12} className="animate-spin" /> : null}
                Confirmar cita
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
