'use client'
import { useState, useEffect, useCallback, useRef, memo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChevronLeft, Save, Printer, ChevronDown, ChevronUp,
  Plus, Trash2, Star, FileText, Camera, Ruler, 
  DollarSign, Clock, CheckCircle, AlertCircle, Loader2,
  MessageCircle, Mail, Download, Upload, Receipt,
  CreditCard, Hash, CalendarDays, Sun, Moon
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

const METODOS_PAGO = ['Efectivo', 'Transferencia', 'MercadoPago', 'Tarjeta crédito', 'Tarjeta débito', 'Otro']

// ── Componentes externos (no se recrean en cada render) ──
function Seccion({ id, titulo, icono: Icono, children, seccionAbierta, setSeccionAbierta }: {
  id: string; titulo: string; icono: any; children: any; seccionAbierta: string; setSeccionAbierta: (v: string) => void
}) {
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

function CampoMedida({ campo, value, onChange }: {
  campo: { key: string; label: string; flecha: string }; value: any; onChange: (key: string, val: string) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${campo.flecha.replace('text-', 'bg-')}`} />
      <span className="text-marfil/50 text-xs flex-1">{campo.label}</span>
      <div className="flex items-center gap-1">
        <input type="number" step="0.5" value={value || ''}
          onChange={e => onChange(campo.key, e.target.value)}
          className="w-16 bg-negro3 border border-marfil/10 text-marfil text-xs px-2 py-1.5 text-center focus:outline-none focus:border-dorado/40 print:border-marfil/30"
          placeholder="—" />
        <span className="text-marfil/25 text-xs">cm</span>
      </div>
    </div>
  )
}

interface Props {
  clienteId: string
  token: string
}

export default function FichaClientaPage({ clienteId, token }: Props) {
  const router = useRouter()
  const [cliente, setCliente] = useState<any>(null)
  const [temaClaro, setTemaClaro] = useState(false)
  useEffect(() => { setTemaClaro(localStorage.getItem('admin_tema') === 'claro') }, [])
  const [ficha, setFicha] = useState<any>({})
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [seccionAbierta, setSeccionAbierta] = useState<string>('datos')
  const [notaNueva, setNotaNueva] = useState('')
  const [subiendoFoto, setSubiendoFoto] = useState<string | null>(null)

  // Presupuesto simplificado
  const [moneda, setMoneda] = useState<'ARS' | 'USD'>('ARS')
  const USD_RATE = 1200
  const [prespTotal, setPrespTotal] = useState('')
  const [prespDescripcion, setPrespDescripcion] = useState('')
  const [prespEstado, setPrespEstado] = useState('pendiente')

  // Pagos / Facturación
  const [showNuevoPago, setShowNuevoPago] = useState(false)
  const [nuevoPago, setNuevoPago] = useState({ monto: '', metodo: 'Transferencia', concepto: 'Anticipo', observaciones: '' })

  // Nueva cita desde ficha
  const [modalCita, setModalCita] = useState(false)
  const [nuevaCita, setNuevaCita] = useState({ fecha: '', hora: '', tipo_cita: 'prueba', tipo_evento: 'novia', notas: '' })
  const [agendandoCita, setAgendandoCita] = useState(false)
  const [horasDisp, setHorasDisp] = useState<string[]>([])

  // Boceto/imagen del presupuesto
  const [subiendoBoceto, setSubiendoBoceto] = useState(false)
  const fileInputBoceto = useRef<HTMLInputElement>(null)

  async function cargarHoras(fecha: string) {
    if (!fecha) return
    const res = await fetch(`/api/disponibilidad?fecha=${fecha}`, { headers: { 'x-admin-token': token } })
    const data = await res.json()
    setHorasDisp(data.disponibles || [])
  }

  async function agendarCita() {
    if (!nuevaCita.fecha || !nuevaCita.hora) { toast.error('Completá fecha y hora'); return }
    setAgendandoCita(true)
    try {
      const res = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
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

  function hdrs() {
    return { 'Content-Type': 'application/json', 'x-admin-token': token }
  }

  useEffect(() => { cargarDatos() }, [clienteId])

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
          if (fi.presupuesto.moneda) setMoneda(fi.presupuesto.moneda)
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
        estado: prespEstado,
        moneda,
        boceto: ficha.presupuesto_boceto || null,
      } : ficha.presupuesto

      const [resFicha, resCliente] = await Promise.all([
        fetch('/api/admin/fichas', {
          method: 'POST',
          headers: hdrs(),
          body: JSON.stringify({ ...ficha, cliente_id: clienteId, presupuesto }),
        }),
        fetch('/api/admin/clientes', {
          method: 'PATCH',
          headers: hdrs(),
          body: JSON.stringify({
            id: clienteId,
            nombre: cliente.nombre,
            email: cliente.email,
            telefono: cliente.telefono,
            ciudad: cliente.ciudad,
            provincia: cliente.provincia,
            codigo_postal: cliente.codigo_postal,
            direccion: cliente.direccion,
          }),
        }),
      ])
      if (!resFicha.ok) throw new Error('Error al guardar la ficha')
      if (!resCliente.ok) throw new Error('Error al guardar los datos de la clienta')
      const data = await resFicha.json()
      const clienteActualizado = await resCliente.json()
      setFicha(data)
      setCliente(clienteActualizado)
      toast.success('Ficha y datos de la clienta guardados')
    } catch (e: any) {
      toast.error(e.message)
    } finally { setGuardando(false) }
  }

  async function cambiarEstado(nuevoEstado: string) {
    const nuevaFicha = { ...ficha, estado_proyecto: nuevoEstado }
    const evento = { fecha: new Date().toISOString(), estado: nuevoEstado, label: ESTADOS_PROYECTO.find(e => e.key === nuevoEstado)?.label }
    nuevaFicha.timeline = [...(ficha.timeline || []), evento]
    setFicha(nuevaFicha)
    const res = await fetch('/api/admin/fichas', { method: 'POST', headers: hdrs(), body: JSON.stringify({ ...nuevaFicha, cliente_id: clienteId }) })
    if (res.ok) toast.success('Estado actualizado')
  }

  function setMedida(key: string, val: string) {
    setFicha((f: any) => ({ ...f, [key]: val === '' ? null : parseFloat(val) }))
  }

  function agregarNota() {
    if (!notaNueva.trim()) return
    const nota = { id: Date.now(), texto: notaNueva, fecha: new Date().toISOString(), importante: false }
    setFicha((f: any) => ({ ...f, notas: [...(f.notas || []), nota] }))
    setNotaNueva('')
  }

  function toggleNotaImportante(id: number) {
    setFicha((f: any) => ({ ...f, notas: f.notas.map((n: any) => n.id === id ? { ...n, importante: !n.importante } : n) }))
  }

  function eliminarNota(id: number) {
    setFicha((f: any) => ({ ...f, notas: f.notas.filter((n: any) => n.id !== id) }))
  }

  async function subirFotoSeccion(seccion: string, file: File) {
    setSubiendoFoto(seccion)
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      const res = await fetch('/api/admin/upload', { method: 'POST', headers: hdrs(), body: JSON.stringify({ base64: reader.result, nombre: file.name }) })
      const json = await res.json()
      if (res.ok && json.url) { setFicha((f: any) => ({ ...f, [seccion]: [...(f[seccion] || []), json.url] })); toast.success('Foto subida') }
      else toast.error('Error al subir')
      setSubiendoFoto(null)
    }
  }

  async function subirBoceto(file: File) {
    setSubiendoBoceto(true)
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      const res = await fetch('/api/admin/upload', { method: 'POST', headers: hdrs(), body: JSON.stringify({ base64: reader.result, nombre: file.name }) })
      const json = await res.json()
      if (res.ok && json.url) { setFicha((f: any) => ({ ...f, presupuesto_boceto: json.url })); toast.success('Boceto subido') }
      else toast.error('Error al subir')
      setSubiendoBoceto(false)
    }
  }

  function agregarPago() {
    if (!nuevoPago.monto) { toast.error('Ingresá el monto'); return }
    const pago = {
      id: Date.now(),
      monto: parseFloat(nuevoPago.monto),
      fecha: new Date().toISOString().split('T')[0],
      metodo: nuevoPago.metodo,
      concepto: nuevoPago.concepto,
      observaciones: nuevoPago.observaciones,
      numero: `R-${Date.now().toString().slice(-6)}`,
    }
    setFicha((f: any) => ({ ...f, pagos: [...(f.pagos || []), pago] }))
    setNuevoPago({ monto: '', metodo: 'Transferencia', concepto: 'Anticipo', observaciones: '' })
    setShowNuevoPago(false)
    toast.success('Pago registrado')
  }

  function eliminarPago(id: number) {
    if (!confirm('¿Eliminar este pago?')) return
    setFicha((f: any) => ({ ...f, pagos: f.pagos.filter((x: any) => x.id !== id) }))
  }

  async function generarComprobante(pago: any) {
    try {
      toast.info('Generando comprobante...')
      const totalPagadoHasta = (ficha.pagos || []).filter((x: any) => x.id <= pago.id).reduce((a: number, x: any) => a + (x.monto || 0), 0)
      const res = await fetch('/api/pdf/comprobante', {
        method: 'POST',
        headers: hdrs(),
        body: JSON.stringify({
          cliente_nombre: cliente?.nombre,
          cliente_email: cliente?.email,
          cliente_telefono: cliente?.telefono,
          monto: pago.monto,
          moneda,
          concepto: pago.concepto || 'Pago',
          metodo_pago: pago.metodo || 'Transferencia',
          fecha_pago: pago.fecha,
          numero: pago.numero,
          presupuesto_total: parseFloat(prespTotal) || 0,
          saldo_restante: (parseFloat(prespTotal) || 0) - totalPagadoHasta,
          tipo_vestido: ficha.tipo_vestido,
        }),
      })
      const json = await res.json()
      const w = window.open('', '_blank')
      if (w) { w.document.write(json.html); w.document.close(); setTimeout(() => w.print(), 500) }
    } catch (e: any) { toast.error(e.message) }
  }

  async function generarPDFPresupuesto() {
    try {
      toast.info('Generando PDF...')
      const res = await fetch('/api/pdf/presupuesto', {
        method: 'POST',
        headers: hdrs(),
        body: JSON.stringify({
          cliente_nombre: cliente?.nombre,
          cliente_email: cliente?.email,
          cliente_telefono: cliente?.telefono,
          descripcion: prespDescripcion,
          total: parseFloat(prespTotal) || 0,
          moneda,
          anticipo: 0,
          cuotas: 1,
          fecha_pago: '',
          estado: prespEstado,
          tipo_vestido: ficha.tipo_vestido,
          color_vestido: ficha.color_vestido,
          fecha_entrega: ficha.fecha_entrega,
          boceto: ficha.presupuesto_boceto || '',
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      const w = window.open('', '_blank')
      if (w) { w.document.write(json.html); w.document.close(); setTimeout(() => w.print(), 500) }
    } catch (e: any) { toast.error(e.message) }
  }

  async function generarFacturaPDF() {
    try {
      toast.info('Generando estado de cuenta...')
      const res = await fetch('/api/pdf/factura', {
        method: 'POST',
        headers: hdrs(),
        body: JSON.stringify({
          cliente_nombre: cliente?.nombre,
          cliente_email: cliente?.email,
          cliente_telefono: cliente?.telefono,
          descripcion: prespDescripcion,
          total: parseFloat(prespTotal) || 0,
          moneda,
          pagos: ficha.pagos || [],
          total_pagado: totalPagado,
          saldo_restante: saldoPendiente,
          tipo_vestido: ficha.tipo_vestido,
          color_vestido: ficha.color_vestido,
          fecha_entrega: ficha.fecha_entrega,
          numero: numFactura,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      const w = window.open('', '_blank')
      if (w) { w.document.write(json.html); w.document.close(); setTimeout(() => w.print(), 500) }
    } catch (e: any) { toast.error(e.message) }
  }

  async function generarMedidasPDF() {
    try {
      toast.info('Generando ficha de medidas...')
      const medidas: any = {}
      const todasLasMedidas = ['sobre_busto','busto','bajo_busto','escote','cintura','cadera_alta','cadera','cadera_baja','largo_corpino_lateral','largo_delantero','largo_total','hombros','sisa','largo_espalda','ancho_espalda','talle','brazo','largo_manga','biceps','codo','muneca','tiro','sobre_rodilla','largo_falda','altura','taco_zapato']
      todasLasMedidas.forEach(k => { if (ficha[k]) medidas[k] = ficha[k] })
      const res = await fetch('/api/pdf/medidas', {
        method: 'POST',
        headers: hdrs(),
        body: JSON.stringify({
          cliente_nombre: cliente?.nombre,
          medidas,
          notas_medidas: ficha.notas_medidas || '',
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      const w = window.open('', '_blank')
      if (w) { w.document.write(json.html); w.document.close(); setTimeout(() => w.print(), 500) }
    } catch (e: any) { toast.error(e.message) }
  }

  function enviarPorWA() {
    if (!cliente) return
    const estado = ESTADOS_PROYECTO.find(e => e.key === ficha.estado_proyecto)?.label || ''
    const msg = `🌹 *Aurelio Martínez Atelier*\n\nHola ${cliente.nombre}!\n\n` +
      `Estado de tu proyecto: *${estado}*\n` +
      (prespTotal ? `Presupuesto: *${moneda === 'USD' ? 'USD ' : '$ '}${parseFloat(prespTotal).toLocaleString('es-AR')}*\n` : '') +
      (ficha.fecha_entrega ? `Fecha de entrega: *${ficha.fecha_entrega}*\n` : '') +
      `\nCualquier consulta estamos disponibles. 💛`
    window.open(`https://wa.me/${cliente.telefono?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  function enviarPresupuestoPorWA() {
    if (!cliente) return
    const msg = `🌹 *Aurelio Martínez Atelier*\n\n*PRESUPUESTO*\n\nHola ${cliente.nombre}!\n\n` +
      (prespDescripcion ? `Diseño: ${prespDescripcion}\n\n` : '') +
      `💰 Total: *${moneda === 'USD' ? 'USD ' : '$ '}${parseFloat(prespTotal).toLocaleString('es-AR')}*\n\n` +
      `Este presupuesto tiene validez de 15 días.\nLa seña confirma el inicio de la confección.\n\n` +
      `¿Confirmamos? 💛`
    window.open(`https://wa.me/${cliente.telefono?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const estadoActual = ESTADOS_PROYECTO.find(e => e.key === ficha.estado_proyecto)
  const totalPagado = (ficha.pagos || []).reduce((a: number, p: any) => a + (p.monto || 0), 0)
  const saldoPendiente = prespTotal ? parseFloat(prespTotal) - totalPagado : 0
  const numFactura = `AM-${clienteId.substring(0, 6).toUpperCase()}`

  if (cargando) return (
    <div className={`min-h-screen bg-negro flex items-center justify-center ${temaClaro ? 'tema-claro' : ''}`}>
      <Loader2 size={24} className="text-dorado animate-spin" />
    </div>
  )

  if (!cliente) return (
    <div className={`min-h-screen bg-negro flex items-center justify-center ${temaClaro ? 'tema-claro' : ''}`}>
      <p className="text-marfil/40">Clienta no encontrada</p>
    </div>
  )

  return (
    <div className={`min-h-screen bg-negro ${temaClaro ? 'tema-claro' : ''}`}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-negro2 border-b border-marfil/8 px-6 py-3 flex items-center justify-between print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-marfil/40 hover:text-marfil transition-colors text-sm">
          <ChevronLeft size={16} /> Volver
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => { const nuevo = !temaClaro; setTemaClaro(nuevo); localStorage.setItem('admin_tema', nuevo ? 'claro' : 'oscuro') }}
            className="flex items-center gap-2 text-marfil/40 hover:text-dorado transition-colors text-xs border border-marfil/10 px-3 py-1.5">
            {temaClaro ? <Moon size={13} /> : <Sun size={13} />}
          </button>
          <button onClick={() => setModalCita(true)} className="flex items-center gap-2 text-dorado/60 hover:text-dorado transition-colors text-xs border border-dorado/20 px-3 py-1.5">
            <Plus size={13} /> Nueva cita
          </button>
          <button onClick={enviarPorWA} className="flex items-center gap-2 text-marfil/40 hover:text-green-400 transition-colors text-xs border border-marfil/10 px-3 py-1.5">
            <MessageCircle size={13} /> WhatsApp
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 text-marfil/40 hover:text-marfil transition-colors text-xs border border-marfil/10 px-3 py-1.5">
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
            <div className="flex-1 min-w-[240px]">
              <p className="text-dorado text-xs tracking-widest uppercase mb-1">Ficha de Clienta</p>
              <input value={cliente.nombre || ''} onChange={e => setCliente((c: any) => ({ ...c, nombre: e.target.value }))}
                className="font-cormorant text-3xl italic font-light bg-transparent border-none outline-none w-full focus:bg-negro3/40 px-0" placeholder="Nombre de la clienta" />
              <div className="flex flex-wrap gap-4 mt-2 items-center">
                <div className="flex items-center gap-1.5">
                  <MessageCircle size={12} className="text-marfil/40 flex-shrink-0" />
                  <input value={cliente.telefono || ''} onChange={e => setCliente((c: any) => ({ ...c, telefono: e.target.value }))}
                    className="text-marfil/50 text-sm bg-transparent border-none outline-none focus:bg-negro3/40 px-0" placeholder="Teléfono" />
                </div>
                <input value={cliente.email || ''} onChange={e => setCliente((c: any) => ({ ...c, email: e.target.value }))}
                  className="text-marfil/50 text-sm bg-transparent border-none outline-none focus:bg-negro3/40 px-0" placeholder="Email" />
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <select value={ficha.estado_proyecto || 'consulta-inicial'} onChange={e => cambiarEstado(e.target.value)} className="select-dark text-xs py-1.5 pr-8">
                {ESTADOS_PROYECTO.map(e => (<option key={e.key} value={e.key}>{e.label}</option>))}
              </select>
              {estadoActual && <span className={`text-xs px-3 py-1 border ${estadoActual.color}`}>{estadoActual.label}</span>}
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mt-5 pt-5 border-t border-marfil/8">
            <div className="flex gap-0 overflow-x-auto">
              {ESTADOS_PROYECTO.map((e, i) => {
                const estados = ESTADOS_PROYECTO.map(x => x.key)
                const posActual = estados.indexOf(ficha.estado_proyecto || 'consulta-inicial')
                const completado = i < posActual
                const activo = e.key === (ficha.estado_proyecto || 'consulta-inicial')
                return (
                  <div key={e.key} className="flex flex-col items-center flex-1 min-w-0">
                    <div className={`h-1 w-full ${completado ? 'bg-dorado' : activo ? 'bg-dorado/50' : 'bg-marfil/8'}`} />
                    <p className={`text-xs mt-1.5 text-center px-1 truncate w-full ${activo ? 'text-dorado' : completado ? 'text-marfil/40' : 'text-marfil/15'}`} style={{fontSize:'9px'}}>{e.label}</p>
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
                {['Novia','15 años','Gala','Miss','Alta Costura'].map(t=><option key={t} value={t} className="capitalize">{t}</option>)}
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

          {/* Datos de contacto */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-marfil/8">
            <div>
              <label className="text-xs text-marfil/30 uppercase tracking-wider block mb-1.5">Ciudad</label>
              <input value={cliente.ciudad || ''} onChange={e => setCliente((c: any) => ({ ...c, ciudad: e.target.value }))} className="input-dark w-full text-xs py-1.5" placeholder="Ciudad" />
            </div>
            <div>
              <label className="text-xs text-marfil/30 uppercase tracking-wider block mb-1.5">Provincia</label>
              <input value={cliente.provincia || ''} onChange={e => setCliente((c: any) => ({ ...c, provincia: e.target.value }))} className="input-dark w-full text-xs py-1.5" placeholder="Provincia" />
            </div>
            <div>
              <label className="text-xs text-marfil/30 uppercase tracking-wider block mb-1.5">Código Postal</label>
              <input value={cliente.codigo_postal || ''} onChange={e => setCliente((c: any) => ({ ...c, codigo_postal: e.target.value }))} className="input-dark w-full text-xs py-1.5" placeholder="CP" />
            </div>
            <div>
              <label className="text-xs text-marfil/30 uppercase tracking-wider block mb-1.5">Dirección</label>
              <input value={cliente.direccion || ''} onChange={e => setCliente((c: any) => ({ ...c, direccion: e.target.value }))} className="input-dark w-full text-xs py-1.5" placeholder="Dirección" />
            </div>
          </div>
        </div>

        {/* MEDIDAS */}
        <Seccion seccionAbierta={seccionAbierta} setSeccionAbierta={setSeccionAbierta} id="medidas" titulo="Medidas de la clienta" icono={Ruler}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-dorado text-xs tracking-widest uppercase mb-4">Vista Frontal & Largo</p>
              <div className="relative bg-negro3 border border-marfil/5 p-4 flex justify-center mb-4">
                <svg viewBox="0 0 200 420" className="w-40 opacity-60" fill="none" stroke="#F5F0E8" strokeWidth="1">
                  <ellipse cx="100" cy="35" rx="22" ry="28" />
                  <line x1="90" y1="63" x2="87" y2="75" /><line x1="110" y1="63" x2="113" y2="75" />
                  <path d="M87,75 Q60,80 50,95" /><path d="M113,75 Q140,80 150,95" />
                  <path d="M50,95 Q48,110 52,120" /><path d="M150,95 Q152,110 148,120" />
                  <path d="M52,120 Q75,125 100,123 Q125,125 148,120" />
                  <path d="M55,150 Q75,155 100,153 Q125,155 145,150" />
                  <path d="M50,180 Q75,185 100,183 Q125,185 150,180" />
                  <line x1="52" y1="120" x2="55" y2="150" /><line x1="148" y1="120" x2="145" y2="150" />
                  <line x1="55" y1="150" x2="50" y2="180" /><line x1="145" y1="150" x2="150" y2="180" />
                  <path d="M50,180 Q48,220 52,280 Q55,330 58,390" /><path d="M150,180 Q152,220 148,280 Q145,330 142,390" />
                  <path d="M52,280 Q75,290 100,288" /><path d="M148,280 Q125,290 100,288" />
                  <path d="M50,95 Q35,130 32,180 Q30,200 34,220" /><path d="M150,95 Q165,130 168,180 Q170,200 166,220" />
                  <ellipse cx="60" cy="395" rx="12" ry="5" /><ellipse cx="140" cy="395" rx="12" ry="5" />
                </svg>
              </div>
              <div className="space-y-2.5">{MEDIDAS_FRENTE.map(m => <CampoMedida key={m.key} campo={m} value={ficha[m.key]} onChange={setMedida} />)}</div>
            </div>
            <div className="space-y-6">
              <div><p className="text-dorado text-xs tracking-widest uppercase mb-3">Espalda</p><div className="space-y-2.5">{MEDIDAS_ESPALDA.map(m => <CampoMedida key={m.key} campo={m} value={ficha[m.key]} onChange={setMedida} />)}</div></div>
              <div><p className="text-dorado text-xs tracking-widest uppercase mb-3">Brazo</p><div className="space-y-2.5">{MEDIDAS_BRAZO.map(m => <CampoMedida key={m.key} campo={m} value={ficha[m.key]} onChange={setMedida} />)}</div></div>
              <div><p className="text-dorado text-xs tracking-widest uppercase mb-3">Falda & Largo</p><div className="space-y-2.5">{MEDIDAS_FALDA.map(m => <CampoMedida key={m.key} campo={m} value={ficha[m.key]} onChange={setMedida} />)}</div></div>
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-marfil/8">
            <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Notas de medidas</label>
            <textarea value={ficha.notas_medidas || ''} onChange={e => setFicha((f:any)=>({...f,notas_medidas:e.target.value}))}
              className="input-dark w-full resize-none" rows={2} placeholder="Observaciones sobre las medidas, postura, particularidades..." />
          </div>
          <div className="mt-4 pt-4 border-t border-marfil/8 flex justify-end">
            <button onClick={generarMedidasPDF} className="btn-ghost flex items-center gap-2 py-2 px-4 text-xs">
              <Printer size={12} /> Imprimir ficha de medidas
            </button>
          </div>
        </Seccion>

        {/* ═══════════════════════════════════ */}
        {/* PRESUPUESTO — SIMPLIFICADO */}
        {/* ═══════════════════════════════════ */}
        <Seccion seccionAbierta={seccionAbierta} setSeccionAbierta={setSeccionAbierta} id="presupuesto" titulo="Presupuesto" icono={DollarSign}>
          <div className="space-y-5">
            {/* Descripción + Boceto */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Descripción del diseño</label>
                <textarea value={prespDescripcion} onChange={e => setPrespDescripcion(e.target.value)}
                  className="input-dark w-full resize-none" rows={4} placeholder="Describe el diseño, materiales, detalles especiales..." />
              </div>
              <div>
                <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Boceto / Imagen</label>
                {ficha.presupuesto_boceto ? (
                  <div className="relative group aspect-[3/4]">
                    <img src={ficha.presupuesto_boceto} alt="Boceto" className="w-full h-full object-cover border border-marfil/10" />
                    <button onClick={() => setFicha((f:any)=>({...f, presupuesto_boceto: null}))}
                      className="absolute top-1 right-1 bg-negro/80 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileInputBoceto.current?.click()} disabled={subiendoBoceto}
                    className="w-full aspect-[3/4] border border-dashed border-marfil/15 flex flex-col items-center justify-center gap-2 hover:border-dorado/30 transition-colors text-marfil/25 hover:text-dorado">
                    {subiendoBoceto ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                    <span className="text-xs">{subiendoBoceto ? 'Subiendo...' : 'Subir boceto'}</span>
                  </button>
                )}
                <input ref={fileInputBoceto} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) subirBoceto(e.target.files[0]); e.target.value='' }} />
              </div>
            </div>

            {/* Monto + Estado */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Monto total</label>
                <div className="flex gap-2">
                  <input type="number" value={prespTotal} onChange={e => setPrespTotal(e.target.value)} className="input-dark flex-1" placeholder="0" />
                  <div className="flex border border-marfil/10">
                    {(['ARS','USD'] as const).map(m => (
                      <button key={m} onClick={() => setMoneda(m)} className={`px-3 text-xs transition-all ${moneda === m ? 'bg-dorado/15 text-dorado' : 'text-marfil/30 hover:text-dorado'}`}>{m}</button>
                    ))}
                  </div>
                </div>
                {prespTotal && moneda === 'USD' && <p className="text-marfil/25 text-xs mt-1">≈ $ {(parseFloat(prespTotal)*USD_RATE).toLocaleString('es-AR')} ARS</p>}
                {prespTotal && moneda === 'ARS' && <p className="text-marfil/25 text-xs mt-1">≈ USD {(parseFloat(prespTotal)/USD_RATE).toFixed(0)}</p>}
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
                <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Clienta</label>
                <p className="text-sm pt-1.5">{cliente.nombre}</p>
                <p className="text-marfil/40 text-xs">{cliente.telefono}</p>
              </div>
            </div>

            {/* Acciones presupuesto */}
            {prespTotal && (
              <div className="flex gap-3 pt-3 border-t border-marfil/8">
                <button onClick={enviarPresupuestoPorWA} className="btn-gold flex-1 justify-center py-2.5 text-xs flex items-center gap-2">
                  <MessageCircle size={12} /> Enviar al cliente
                </button>
                <button onClick={generarPDFPresupuesto} className="btn-ghost flex-1 justify-center py-2.5 text-xs flex items-center gap-2">
                  <Download size={12} /> Descargar PDF
                </button>
                <button onClick={generarPDFPresupuesto} className="btn-ghost flex-1 justify-center py-2.5 text-xs flex items-center gap-2">
                  <Printer size={12} /> Imprimir
                </button>
              </div>
            )}
          </div>
        </Seccion>

        {/* ═══════════════════════════════════ */}
        {/* PAGOS / FACTURACIÓN */}
        {/* ═══════════════════════════════════ */}
        <Seccion seccionAbierta={seccionAbierta} setSeccionAbierta={setSeccionAbierta} id="pagos" titulo="Pagos & Facturación" icono={Receipt}>
          <div className="space-y-5">

            {/* Resumen financiero */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-negro3 border border-marfil/8 p-4 text-center">
                <p className="text-xs text-marfil/30 uppercase tracking-wider mb-1">Total presupuesto</p>
                <p className="font-cormorant text-2xl text-marfil">{prespTotal ? (moneda === 'USD' ? `USD ${parseFloat(prespTotal).toLocaleString()}` : formatPrecio(parseFloat(prespTotal))) : '—'}</p>
              </div>
              <div className="bg-negro3 border border-green-400/15 p-4 text-center">
                <p className="text-xs text-green-400/50 uppercase tracking-wider mb-1">Total cobrado</p>
                <p className="font-cormorant text-2xl text-green-400/80">{formatPrecio(totalPagado)}</p>
              </div>
              <div className={`bg-negro3 border p-4 text-center ${saldoPendiente > 0 ? 'border-dorado/20' : 'border-green-400/20'}`}>
                <p className="text-xs text-dorado/60 uppercase tracking-wider mb-1">Saldo pendiente</p>
                <p className={`font-cormorant text-2xl ${saldoPendiente > 0 ? 'text-dorado' : 'text-green-400/80'}`}>
                  {prespTotal ? formatPrecio(saldoPendiente) : '—'}
                </p>
              </div>
            </div>

            {/* Info factura */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-marfil/30 text-xs">
                  <Hash size={11} /> <span>Ref: {numFactura}</span>
                </div>
                <div className="flex items-center gap-2 text-marfil/30 text-xs">
                  <CalendarDays size={11} /> <span>{new Date().toLocaleDateString('es-AR')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {prespTotal && (ficha.pagos || []).length > 0 && (
                  <button onClick={generarFacturaPDF} className="btn-ghost flex items-center gap-1.5 py-2 px-4 text-xs">
                    <Download size={12} /> Descargar PDF
                  </button>
                )}
                {prespTotal && (ficha.pagos || []).length > 0 && (
                  <button onClick={generarFacturaPDF} className="btn-ghost flex items-center gap-1.5 py-2 px-4 text-xs">
                    <Printer size={12} /> Imprimir
                  </button>
                )}
                <button onClick={() => setShowNuevoPago(true)} className="btn-gold flex items-center gap-1.5 py-2 px-4 text-xs">
                  <Plus size={12} /> Registrar pago
                </button>
              </div>
            </div>

            {/* Formulario nuevo pago */}
            {showNuevoPago && (
              <div className="bg-negro3 border border-dorado/20 p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-dorado tracking-widest uppercase">Nuevo pago</p>
                  <button onClick={() => setShowNuevoPago(false)} className="text-marfil/30 hover:text-marfil"><Trash2 size={13} /></button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Monto *</label>
                    <input type="number" value={nuevoPago.monto} onChange={e => setNuevoPago(p => ({...p, monto: e.target.value}))} className="input-dark w-full" placeholder="0" />
                  </div>
                  <div>
                    <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Método de pago</label>
                    <select value={nuevoPago.metodo} onChange={e => setNuevoPago(p => ({...p, metodo: e.target.value}))} className="select-dark w-full">
                      {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Concepto</label>
                    <select value={nuevoPago.concepto} onChange={e => setNuevoPago(p => ({...p, concepto: e.target.value}))} className="select-dark w-full">
                      {['Anticipo', 'Seña', 'Cuota', 'Pago parcial', 'Saldo final', 'Ajuste', 'Otro'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Observaciones</label>
                    <input value={nuevoPago.observaciones} onChange={e => setNuevoPago(p => ({...p, observaciones: e.target.value}))} className="input-dark w-full" placeholder="Opcional..." />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={agregarPago} className="btn-gold-fill flex-1 justify-center py-2.5 text-xs">Confirmar pago</button>
                  <button onClick={() => setShowNuevoPago(false)} className="btn-ghost flex-1 justify-center py-2.5 text-xs">Cancelar</button>
                </div>
              </div>
            )}

            {/* Historial de pagos */}
            <div>
              <p className="text-xs text-marfil/40 uppercase tracking-wider mb-3">Historial de pagos</p>
              <div className="space-y-2">
                {[...(ficha.pagos || [])].reverse().map((p: any) => (
                  <div key={p.id} className="bg-negro3 border border-marfil/6 px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-8 h-8 bg-green-400/10 border border-green-400/20 flex items-center justify-center flex-shrink-0">
                        <CreditCard size={13} className="text-green-400/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{p.concepto || 'Pago'}</p>
                          <span className="text-marfil/20 text-xs">·</span>
                          <span className="text-marfil/40 text-xs">{p.metodo}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-marfil/30 text-xs">{p.fecha}</p>
                          {p.numero && <span className="text-marfil/20 text-xs">{p.numero}</span>}
                          {p.observaciones && <span className="text-marfil/25 text-xs italic">— {p.observaciones}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <p className="text-green-400/80 font-cormorant text-lg">{formatPrecio(p.monto)}</p>
                      <button onClick={() => generarComprobante(p)} className="text-marfil/20 hover:text-dorado transition-colors" title="Descargar comprobante">
                        <Download size={13} />
                      </button>
                      <button onClick={() => eliminarPago(p.id)} className="text-marfil/20 hover:text-red-400/60 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
                {(ficha.pagos || []).length === 0 && (
                  <div className="text-center py-8 border border-dashed border-marfil/8">
                    <Receipt size={24} className="text-marfil/10 mx-auto mb-2" />
                    <p className="text-marfil/20 text-xs">Sin pagos registrados</p>
                  </div>
                )}
              </div>
            </div>

            {/* Barra de progreso de pago */}
            {prespTotal && parseFloat(prespTotal) > 0 && (
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-marfil/40">Progreso de cobro</span>
                  <span className="text-dorado">{Math.min(100, Math.round((totalPagado / parseFloat(prespTotal)) * 100))}%</span>
                </div>
                <div className="h-2 bg-marfil/5 w-full">
                  <div className="h-full bg-gradient-to-r from-dorado/60 to-dorado transition-all" style={{ width: `${Math.min(100, (totalPagado / parseFloat(prespTotal)) * 100)}%` }} />
                </div>
              </div>
            )}
          </div>
        </Seccion>

        {/* NOTAS */}
        <Seccion seccionAbierta={seccionAbierta} setSeccionAbierta={setSeccionAbierta} id="notas" titulo="Notas del proyecto" icono={FileText}>
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
                      <button onClick={() => toggleNotaImportante(n.id)} className={`transition-colors ${n.importante ? 'text-dorado' : 'text-marfil/20 hover:text-dorado'}`}>
                        <Star size={13} fill={n.importante ? 'currentColor' : 'none'} />
                      </button>
                      <button onClick={() => eliminarNota(n.id)} className="text-marfil/20 hover:text-red-400/60 transition-colors"><Trash2 size={13} /></button>
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
        <Seccion seccionAbierta={seccionAbierta} setSeccionAbierta={setSeccionAbierta} id="fotos" titulo="Fotos, bocetos y referencias" icono={Camera}>
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
                      className="absolute top-1 right-1 bg-negro/80 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"><Trash2 size={11} /></button>
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
        <Seccion seccionAbierta={seccionAbierta} setSeccionAbierta={setSeccionAbierta} id="timeline" titulo="Historial del proyecto" icono={Clock}>
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
                    <option value="novia">Novia</option><option value="quinceanera">Quinceañera</option><option value="gala">Gala</option><option value="miss">Miss</option><option value="otro">Otro</option>
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
                        className={`py-2 text-xs border transition-all ${nuevaCita.hora===h ? 'border-dorado bg-dorado/10 text-dorado' : 'border-marfil/10 text-marfil/50 hover:border-dorado/30'}`}>{h}</button>
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
