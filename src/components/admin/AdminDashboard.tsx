'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar, ShoppingBag, Package, Clock, LogOut, Plus, Trash2,
  CheckCircle, XCircle, RefreshCw, BarChart3, Upload, X, MapPin,
  TrendingUp, Images, Users, Search, Star, Filter, Download,
  Tag, Loader2, Bell, ChevronDown, Settings, Printer, Menu, ArrowUpRight, Activity, Power
} from 'lucide-react'
import { formatPrecio, formatHora } from '@/lib/utils'
import CalendarioCitas from './CalendarioCitas'
import { toast } from 'sonner'
import type { Cita, Pedido, Producto } from '@/types'

type Tab = 'dashboard' | 'citas' | 'pedidos' | 'productos' | 'colecciones' | 'clientes' | 'horarios' | 'sitio'

const ESTADO_PEDIDO_COLORS: Record<string, string> = {
  pendiente: 'text-yellow-400/70 bg-yellow-400/10',
  pagado: 'text-blue-400/70 bg-blue-400/10',
  preparando: 'text-dorado bg-dorado/10',
  enviado: 'text-purple-400/70 bg-purple-400/10',
  entregado: 'text-green-400/80 bg-green-400/10',
  cancelado: 'text-red-400/70 bg-red-400/10',
}

const ESTADO_CITA_COLORS: Record<string, string> = {
  confirmada: 'text-dorado bg-dorado/10',
  completada: 'text-green-400/80 bg-green-400/10',
  cancelada: 'text-red-400/70 bg-red-400/10',
  'no-asistio': 'text-marfil/30 bg-marfil/5',
}

// ── Uncontrolled input — never loses focus ──
function FormInput({ label, value, onChange, type = 'text', placeholder = '', className = 'input-dark', rows }: {
  label?: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; className?: string; rows?: number
}) {
  const ref = useRef<any>(null)
  useEffect(() => {
    if (ref.current && ref.current !== document.activeElement) {
      ref.current.value = value
    }
  })
  if (rows) return (
    <div>
      {label && <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">{label}</label>}
      <textarea ref={ref} defaultValue={value} onInput={e => onChange((e.target as any).value)}
        className={`${className} resize-none w-full`} rows={rows} placeholder={placeholder} />
    </div>
  )
  return (
    <div>
      {label && <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">{label}</label>}
      <input ref={ref} type={type} defaultValue={value} onInput={e => onChange((e.target as any).value)}
        className={className} placeholder={placeholder} />
    </div>
  )
}

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [citas, setCitas] = useState<Cita[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [colecciones, setColecciones] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [horarios, setHorarios] = useState<any[]>([])
  const [configSitio, setConfigSitio] = useState<any>({})
  const [subiendoImgSitio, setSubiendoImgSitio] = useState<string | null>(null)
  const [categorias, setCategorias] = useState<any[]>([])
  const [cargando, setCargando] = useState(false)

  const [busquedaPedidos, setBusquedaPedidos] = useState('')
  const [busquedaClientes, setBusquedaClientes] = useState('')
  const [filtroClientes, setFiltroClientes] = useState('')
  const [busquedaGlobal, setBusquedaGlobal] = useState('')
  const [filtroPedidoEstado, setFiltroPedidoEstado] = useState('')
  const [periodo, setPeriodo] = useState<'semana' | 'mes' | 'total'>('mes')

  // Form states
  const [showNuevoProducto, setShowNuevoProducto] = useState(false)
  const [productoEditando, setProductoEditando] = useState<string | null>(null)
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', descripcion: '', precio: '', categoria: 'batas', stock: '5', slug: '', imagenes: [] as string[], destacado: false })
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showNuevaCat, setShowNuevaCat] = useState(false)
  const [nuevaCatNombre, setNuevaCatNombre] = useState('')

  const [showNuevaColeccion, setShowNuevaColeccion] = useState(false)
  const [coleccionEditando, setColeccionEditando] = useState<string | null>(null)
  const [nuevaColeccion, setNuevaColeccion] = useState({ nombre: '', descripcion: '', imagen_principal: '', imagenes: [] as string[], categoria: 'novias', año: '2025', destacado: false, orden: '0' })
  const [subiendoFotoCol, setSubiendoFotoCol] = useState(false)
  const fileInputColRef = useRef<HTMLInputElement>(null)

  const [showNuevoHorario, setShowNuevoHorario] = useState(false)
  const [nuevoHorario, setNuevoHorario] = useState({ fecha: '', fecha_fin: '', todo_el_dia: true, hora_inicio: '11:00', hora_fin_hora: '18:00', motivo: '' })
  const [bloqueoPorRango, setBloqueoPorRango] = useState(false)

  const [showNuevoCliente, setShowNuevoCliente] = useState(false)
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', email: '', telefono: '', tipo_evento_habitual: '' })

  function getToken() { return sessionStorage.getItem('admin_token') || '' }
  function authHeaders() { return { 'Content-Type': 'application/json', 'x-admin-token': getToken() } }

  async function cargar(tipo: string) {
    setCargando(true)
    try {
      const res = await fetch(`/api/admin/${tipo}`, { headers: { 'x-admin-token': getToken() } })
      const data = await res.json()
      if (tipo === 'citas') setCitas(data ?? [])
      if (tipo === 'pedidos') setPedidos(data ?? [])
      if (tipo === 'productos') setProductos(data ?? [])
      if (tipo === 'colecciones') setColecciones(data ?? [])
      if (tipo === 'clientes') setClientes(data ?? [])
      if (tipo === 'horarios') setHorarios(data ?? [])
      if (tipo === 'configuracion') setConfigSitio(data ?? {})
      if (tipo === 'categorias') setCategorias(data ?? [])
    } finally { setCargando(false) }
  }

  useEffect(() => {
    cargar('citas'); cargar('pedidos'); cargar('productos')
    cargar('colecciones'); cargar('clientes'); cargar('horarios'); cargar('categorias'); cargar('configuracion')
  }, [])

  function exportCSV(tipo: 'clientes' | 'pedidos') {
    if (tipo === 'clientes') {
      const rows = [['Nombre','Email','Teléfono','Evento','Ciudad','Citas']]
      clientes.forEach(c => rows.push([c.nombre, c.email, c.telefono || '', c.tipo_evento_habitual || '', c.ciudad || '', String(c.total_citas || 0)]))
      downloadCSV(rows, 'clientes-aurelio.csv')
    } else {
      const rows = [['Número','Cliente','Email','Total','Estado','Fecha','Provincia']]
      pedidos.forEach(p => rows.push([p.numero, p.cliente_nombre, p.cliente_email, String(p.total), p.estado, p.created_at?.split('T')[0] || '', (p as any).provincia_envio || '']))
      downloadCSV(rows, 'pedidos-aurelio.csv')
    }
  }

  function downloadCSV(rows: string[][], filename: string) {
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  async function actualizarCita(id: string, estado: string) {
    const res = await fetch('/api/admin/citas', { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ id, estado }) })
    if (res.ok) { setCitas(cs => cs.map(c => c.id === id ? { ...c, estado: estado as any } : c)); toast.success('Cita actualizada') }
  }

  async function eliminarCita(id: string) {
    if (!confirm('¿Eliminar esta cita permanentemente?')) return
    await fetch('/api/admin/citas', { method: 'DELETE', headers: authHeaders(), body: JSON.stringify({ id }) })
    setCitas(cs => cs.filter(c => c.id !== id)); toast.success('Cita eliminada')
  }

  async function actualizarPedido(id: string, estado: string) {
    const res = await fetch('/api/admin/pedidos', { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ id, estado }) })
    if (res.ok) { setPedidos(ps => ps.map(p => p.id === id ? { ...p, estado: estado as any } : p)); toast.success('Pedido actualizado') }
  }

  async function cancelarPedido(id: string) {
    if (!confirm('¿Cancelar este pedido?')) return
    await actualizarPedido(id, 'cancelado')
  }

  async function ocultarPedidoCancelado(id: string) {
    const res = await fetch('/api/admin/pedidos', { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ id, oculto: true }) })
    if (res.ok) { setPedidos(ps => ps.filter(p => p.id !== id)); toast.success('Pedido removido de la vista') }
  }

  async function crearProducto() {
    if (!nuevoProducto.nombre || !nuevoProducto.precio) { toast.error('Nombre y precio requeridos'); return }
    const slug = nuevoProducto.slug || nuevoProducto.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const method = productoEditando ? 'PATCH' : 'POST'
    const body = productoEditando
      ? { id: productoEditando, ...nuevoProducto, precio: parseFloat(nuevoProducto.precio), stock: parseInt(nuevoProducto.stock), slug, variantes: [] }
      : { ...nuevoProducto, precio: parseFloat(nuevoProducto.precio), stock: parseInt(nuevoProducto.stock), slug, variantes: [], imagenes: nuevoProducto.imagenes }
    const res = await fetch('/api/admin/productos', { method, headers: authHeaders(), body: JSON.stringify(body) })
    if (res.ok) {
      const data = await res.json()
      if (productoEditando) { setProductos(ps => ps.map(p => p.id === productoEditando ? data : p)); toast.success('Producto actualizado') }
      else { setProductos(ps => [data, ...ps]); toast.success('Producto creado') }
      setNuevoProducto({ nombre: '', descripcion: '', precio: '', categoria: 'batas', stock: '5', slug: '', imagenes: [], destacado: false })
      setShowNuevoProducto(false); setProductoEditando(null)
    } else { const err = await res.json(); toast.error(err.error || 'Error') }
  }

  async function toggleActivoProducto(id: string, activo: boolean) {
    if (!confirm(activo ? '¿Activar este producto? Volverá a verse en la tienda.' : '¿Desactivar este producto? Dejará de verse en la tienda, pero conservás toda su info para reactivarlo cuando quieras.')) return
    const res = await fetch('/api/admin/productos', { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ id, activo }) })
    if (!res.ok) { const err = await res.json().catch(() => ({})); toast.error(err.error || 'No se pudo actualizar el producto'); return }
    setProductos(ps => ps.map(p => p.id === id ? { ...p, activo } : p))
    toast.success(activo ? 'Producto activado' : 'Producto desactivado')
  }

  async function eliminarProducto(id: string) {
    if (!confirm('¿Eliminar este producto definitivamente? Esta acción no se puede deshacer y se pierde toda su info. Si solo querés ocultarlo, usá "Desactivar" en su lugar.')) return
    const res = await fetch('/api/admin/productos', { method: 'DELETE', headers: authHeaders(), body: JSON.stringify({ id }) })
    if (!res.ok) { const err = await res.json().catch(() => ({})); toast.error(err.error || 'No se pudo eliminar el producto'); return }
    setProductos(ps => ps.filter(p => p.id !== id))
    toast.success('Producto eliminado')
  }

  async function toggleDestacado(id: string, destacado: boolean) {
    await fetch('/api/admin/productos', { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ id, destacado }) })
    setProductos(ps => ps.map(p => p.id === id ? { ...p, destacado } : p))
    toast.success(destacado ? '⭐ Marcado como destacado' : 'Quitado de destacados')
  }

  async function subirFoto(file: File) {
    setSubiendoFoto(true)
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      const res = await fetch('/api/admin/upload', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ base64: reader.result, nombre: file.name }) })
      const json = await res.json()
      if (res.ok && json.url) { setNuevoProducto(p => ({ ...p, imagenes: [...p.imagenes, json.url] })); toast.success('Foto subida') }
      else toast.error(json.error || 'Error al subir')
      setSubiendoFoto(false)
    }
  }

  async function crearCategoria() {
    if (!nuevaCatNombre.trim()) return
    const res = await fetch('/api/admin/categorias', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ nombre: nuevaCatNombre }) })
    if (res.ok) { const data = await res.json(); setCategorias(cs => [...cs, data]); setNuevaCatNombre(''); setShowNuevaCat(false); toast.success('Categoría creada') }
    else toast.error('Error al crear categoría')
  }

  async function eliminarCategoria(id: string) {
    if (!confirm('¿Eliminar esta categoría?')) return
    const res = await fetch('/api/admin/categorias', { method: 'DELETE', headers: authHeaders(), body: JSON.stringify({ id }) })
    if (res.ok) { setCategorias(cs => cs.filter(c => c.id !== id)); toast.success('Categoría eliminada') }
    else { const err = await res.json(); toast.error(err.error || 'Error') }
  }

  async function subirFotoColeccion(file: File) {
    setSubiendoFotoCol(true)
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      const res = await fetch('/api/admin/upload', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ base64: reader.result, nombre: file.name }) })
      const json = await res.json()
      if (res.ok && json.url) { setNuevaColeccion(c => ({ ...c, imagen_principal: json.url })); toast.success('Foto subida') }
      else toast.error(json.error || 'Error al subir')
      setSubiendoFotoCol(false)
    }
  }

  async function subirImagenSitio(campo: string, file: File) {
    setSubiendoImgSitio(campo)
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      const res = await fetch('/api/admin/upload', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ base64: reader.result, nombre: file.name }) })
      const json = await res.json()
      if (res.ok && json.url) {
        const patchRes = await fetch('/api/admin/configuracion', { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ [campo]: json.url }) })
        if (patchRes.ok) { const data = await patchRes.json(); setConfigSitio(data); toast.success('Imagen actualizada') }
        else toast.error('No se pudo guardar la imagen')
      } else toast.error(json.error || 'Error al subir')
      setSubiendoImgSitio(null)
    }
  }

  async function subirImagenInstagram(idx: number, file: File) {
    const campo = `instagram-${idx}`
    setSubiendoImgSitio(campo)
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      const res = await fetch('/api/admin/upload', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ base64: reader.result, nombre: file.name }) })
      const json = await res.json()
      if (res.ok && json.url) {
        const actuales: string[] = Array.isArray(configSitio.instagram_imagenes) ? [...configSitio.instagram_imagenes] : []
        while (actuales.length < 6) actuales.push('')
        actuales[idx] = json.url
        const patchRes = await fetch('/api/admin/configuracion', { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ instagram_imagenes: actuales }) })
        if (patchRes.ok) { const data = await patchRes.json(); setConfigSitio(data); toast.success('Imagen actualizada') }
        else toast.error('No se pudo guardar la imagen')
      } else toast.error(json.error || 'Error al subir')
      setSubiendoImgSitio(null)
    }
  }

  async function crearColeccion() {
    if (!nuevaColeccion.nombre || !nuevaColeccion.imagen_principal) { toast.error('Nombre y foto requeridos'); return }
    const method = coleccionEditando ? 'PATCH' : 'POST'
    const body = coleccionEditando
      ? { id: coleccionEditando, ...nuevaColeccion, año: parseInt(nuevaColeccion.año), orden: parseInt(nuevaColeccion.orden), activo: true }
      : { ...nuevaColeccion, año: parseInt(nuevaColeccion.año), orden: parseInt(nuevaColeccion.orden), activo: true }
    const res = await fetch('/api/admin/colecciones', { method, headers: authHeaders(), body: JSON.stringify(body) })
    if (res.ok) {
      const data = await res.json()
      if (coleccionEditando) { setColecciones(cs => cs.map(c => c.id === coleccionEditando ? data : c)); toast.success('Colección actualizada') }
      else { setColecciones(cs => [data, ...cs]); toast.success('Diseño agregado') }
      setNuevaColeccion({ nombre: '', descripcion: '', imagen_principal: '', imagenes: [], categoria: 'novias', año: '2025', destacado: false, orden: '0' })
      setShowNuevaColeccion(false); setColeccionEditando(null)
    } else { const err = await res.json(); toast.error(err.error || 'Error') }
  }

  async function eliminarColeccion(id: string) {
    if (!confirm('¿Eliminar este diseño?')) return
    await fetch('/api/admin/colecciones', { method: 'DELETE', headers: authHeaders(), body: JSON.stringify({ id }) })
    setColecciones(cs => cs.filter(c => c.id !== id)); toast.success('Diseño eliminado')
  }

  async function crearCliente() {
    if (!nuevoCliente.nombre || !nuevoCliente.email) { toast.error('Nombre y email requeridos'); return }
    const res = await fetch('/api/admin/clientes', { method: 'POST', headers: authHeaders(), body: JSON.stringify(nuevoCliente) })
    if (res.ok) {
      const data = await res.json(); setClientes(cs => [data, ...cs])
      setNuevoCliente({ nombre: '', email: '', telefono: '', tipo_evento_habitual: '' })
      setShowNuevoCliente(false); toast.success('Clienta agregada')
    } else toast.error('Error al agregar clienta')
  }

  async function eliminarCliente(id: string) {
    if (!confirm('¿Eliminar esta clienta?')) return
    await fetch('/api/admin/clientes', { method: 'DELETE', headers: authHeaders(), body: JSON.stringify({ id }) })
    setClientes(cs => cs.filter(c => c.id !== id)); toast.success('Clienta eliminada')
  }

  async function bloquearHorario() {
    if (!nuevoHorario.fecha) { toast.error('Fecha requerida'); return }
    const bloques = []
    if (bloqueoPorRango && nuevoHorario.fecha_fin) {
      const start = new Date(nuevoHorario.fecha + 'T00:00:00')
      const end = new Date(nuevoHorario.fecha_fin + 'T00:00:00')
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        bloques.push({ fecha: d.toISOString().split('T')[0], todo_el_dia: nuevoHorario.todo_el_dia, hora_inicio: nuevoHorario.hora_inicio, hora_fin: nuevoHorario.hora_fin_hora, motivo: nuevoHorario.motivo })
      }
    } else {
      bloques.push({ fecha: nuevoHorario.fecha, todo_el_dia: nuevoHorario.todo_el_dia, hora_inicio: nuevoHorario.hora_inicio, hora_fin: nuevoHorario.hora_fin_hora, motivo: nuevoHorario.motivo })
    }
    let exitosos = 0
    let ultimoError = ''
    for (const b of bloques) {
      const res = await fetch('/api/admin/horarios', { method: 'POST', headers: authHeaders(), body: JSON.stringify(b) })
      if (res.ok) { const data = await res.json(); setHorarios(hs => [...hs, data]); exitosos++ }
      else { const err = await res.json().catch(() => ({})); ultimoError = err.error || 'Error desconocido' }
    }
    setShowNuevoHorario(false)
    if (exitosos === bloques.length) toast.success(`${exitosos} horario(s) bloqueado(s)`)
    else if (exitosos > 0) toast.error(`Se bloquearon ${exitosos} de ${bloques.length}. Error: ${ultimoError}`)
    else toast.error(`No se pudo bloquear el horario. ${ultimoError}`)
  }

  async function desbloquearHorario(id: string) {
    if (!confirm('¿Desbloquear?')) return
    const res = await fetch('/api/admin/horarios', { method: 'DELETE', headers: authHeaders(), body: JSON.stringify({ id }) })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || 'No se pudo desbloquear el horario'); return
    }
    setHorarios(hs => hs.filter(h => h.id !== id)); toast.success('Horario desbloqueado')
  }

  function filtrarPorPeriodo(items: any[], campo = 'created_at') {
    const ahora = new Date()
    return items.filter(i => {
      if (!i[campo]) return false
      const f = new Date(i[campo])
      if (periodo === 'semana') return (ahora.getTime() - f.getTime()) < 7 * 86400000
      if (periodo === 'mes') return f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear()
      return true
    })
  }

  const pedidosFiltrados = filtrarPorPeriodo(pedidos).filter(p => p.estado !== 'cancelado')
  const ingresosMes = pedidosFiltrados.reduce((a, p) => a + (p.total || 0), 0)
  const mesAnterior = new Date(); mesAnterior.setMonth(mesAnterior.getMonth() - 1)
  const ingresosMesAnterior = pedidos.filter(p => {
    if (!p.created_at || p.estado === 'cancelado') return false
    const f = new Date(p.created_at)
    return f.getMonth() === mesAnterior.getMonth() && f.getFullYear() === mesAnterior.getFullYear()
  }).reduce((a, p) => a + (p.total || 0), 0)
  const variacionIngresos = ingresosMesAnterior > 0 ? Math.round(((ingresosMes - ingresosMesAnterior) / ingresosMesAnterior) * 100) : 0
  const citasHoy = citas.filter(c => c.fecha === new Date().toISOString().split('T')[0] && c.estado === 'confirmada').length
  const ventasPorDia = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().split('T')[0]
    const label = d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' })
    const total = pedidos.filter(p => p.estado !== 'cancelado' && p.created_at?.startsWith(key)).reduce((a, p) => a + (p.total || 0), 0)
    const nCitas = citas.filter(c => c.fecha === key && c.estado !== 'cancelada').length
    return { label, total, nCitas, key }
  })
  const maxVenta = Math.max(...ventasPorDia.map(v => v.total), 1)
  const conteoProductos: Record<string, { nombre: string; cantidad: number; ingresos: number }> = {}
  pedidosFiltrados.forEach(p => {
    (p.items as any[] || []).forEach((item: any) => {
      if (!conteoProductos[item.nombre]) conteoProductos[item.nombre] = { nombre: item.nombre, cantidad: 0, ingresos: 0 }
      conteoProductos[item.nombre].cantidad += item.cantidad || 1
      conteoProductos[item.nombre].ingresos += (item.precio || 0) * (item.cantidad || 1)
    })
  })
  const topProductos = Object.values(conteoProductos).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5)
  const conteoProvincias: Record<string, number> = {}
  pedidosFiltrados.forEach(p => { const prov = (p as any).provincia_envio || 'Sin especificar'; conteoProvincias[prov] = (conteoProvincias[prov] || 0) + 1 })
  const topProvincias = Object.entries(conteoProvincias).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const pedidosMostrar = pedidos.filter(p => {
    if ((p as any).oculto) return false
    const q = busquedaPedidos.toLowerCase()
    const matchSearch = !q || p.numero?.toLowerCase().includes(q) || p.cliente_nombre?.toLowerCase().includes(q) || p.cliente_email?.toLowerCase().includes(q)
    const matchEstado = !filtroPedidoEstado || p.estado === filtroPedidoEstado
    return matchSearch && matchEstado
  })
  const clientesMostrar = clientes.filter(c => {
    const q = busquedaClientes.toLowerCase()
    const matchSearch = !q || c.nombre?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.telefono?.includes(q)
    const matchFiltro = !filtroClientes || c.tipo_evento_habitual === filtroClientes
    return matchSearch && matchFiltro
  })

  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Notification badges
  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente' && !(p as any).oculto).length
  const citasConfirmadas = citas.filter(c => c.estado === 'confirmada').length

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, badge: 0 },
    { id: 'citas', label: 'Citas', icon: Calendar, badge: citasConfirmadas },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag, badge: pedidosPendientes },
    { id: 'productos', label: 'Productos', icon: Package, badge: 0 },
    { id: 'colecciones', label: 'Galerías', icon: Images, badge: 0 },
    { id: 'clientes', label: 'Clientas', icon: Users, badge: 0 },
    { id: 'horarios', label: 'Horarios', icon: Clock, badge: 0 },
    { id: 'sitio', label: 'Imágenes del Sitio', icon: Images, badge: 0 },
  ]

  return (
    <div className="min-h-screen bg-negro flex">
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-negro2 border-b border-marfil/8 px-4 py-3 flex items-center justify-between md:hidden">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-marfil/50 hover:text-dorado transition-colors">
          <Menu size={20} />
        </button>
        <p className="font-cormorant text-sm tracking-widest uppercase text-marfil/80">Aurelio Martínez</p>
        <div className="flex items-center gap-2">
          {pedidosPendientes > 0 && (
            <button onClick={() => { setTab('pedidos'); setSidebarOpen(false) }} className="relative">
              <ShoppingBag size={16} className="text-marfil/40" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-dorado text-negro flex items-center justify-center rounded-full" style={{fontSize:'9px'}}>{pedidosPendientes}</span>
            </button>
          )}
        </div>
      </div>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-negro/80 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-60 bg-negro2 border-r border-marfil/5 flex flex-col flex-shrink-0 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-5 border-b border-marfil/5">
          <p className="font-cormorant text-sm tracking-widest uppercase text-marfil/80">Aurelio Martínez</p>
          <p className="text-dorado text-xs tracking-wider mt-0.5">Panel Admin</p>
          <div className="flex gap-3 mt-3 pt-3 border-t border-marfil/5">
            <div className="flex-1 text-center">
              <p className="font-cormorant text-lg text-dorado">{citasHoy}</p>
              <p className="text-marfil/25" style={{fontSize:'9px'}}>Citas hoy</p>
            </div>
            <div className="w-px bg-marfil/5" />
            <div className="flex-1 text-center">
              <p className="font-cormorant text-lg text-dorado">{pedidosPendientes}</p>
              <p className="text-marfil/25" style={{fontSize:'9px'}}>Pendientes</p>
            </div>
            <div className="w-px bg-marfil/5" />
            <div className="flex-1 text-center">
              <p className="font-cormorant text-lg text-dorado">{clientes.length}</p>
              <p className="text-marfil/25" style={{fontSize:'9px'}}>Clientas</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {TABS.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} onClick={() => { setTab(id as Tab); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all text-left rounded-sm ${tab === id ? 'bg-dorado/10 text-dorado border-l-2 border-dorado -ml-px pl-[11px]' : 'text-marfil/40 hover:text-marfil/70 hover:bg-marfil/3'}`}>
              <Icon size={14} strokeWidth={1.5} />
              <span className="flex-1">{label}</span>
              {badge > 0 && <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-dorado/20 text-dorado rounded-full" style={{fontSize:'10px'}}>{badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-marfil/5 space-y-1">
          <a href="https://aurelio-atelier.vercel.app" target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-marfil/25 hover:text-dorado transition-colors">
            <ArrowUpRight size={12} /> Ver sitio web
          </a>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-marfil/25 hover:text-marfil/50 transition-colors">
            <LogOut size={14} strokeWidth={1.5} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto md:h-screen">
        <div className="p-4 md:p-6 pt-16 md:pt-6">

          {tab === 'dashboard' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-cormorant text-2xl italic">Dashboard</h1>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1 border border-marfil/10 p-1">
                    {(['semana','mes','total'] as const).map(p => (
                      <button key={p} onClick={() => setPeriodo(p)}
                        className={`text-xs px-3 py-1.5 capitalize transition-all ${periodo === p ? 'bg-dorado/15 text-dorado' : 'text-marfil/40 hover:text-marfil/70'}`}>{p}</button>
                    ))}
                  </div>
                  <button onClick={() => exportCSV('pedidos')} className="flex items-center gap-1.5 text-xs text-marfil/40 hover:text-dorado border border-marfil/10 px-3 py-1.5 transition-all">
                    <Download size={12} /> Exportar
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Citas hoy', value: citasHoy, sub: null, icon: Calendar, color: 'text-dorado' },
                  { label: 'Pedidos activos', value: pedidosFiltrados.length, sub: null, icon: ShoppingBag, color: 'text-blue-400/70' },
                  { label: 'Ingresos', value: formatPrecio(ingresosMes), sub: variacionIngresos !== 0 ? `${variacionIngresos > 0 ? '+' : ''}${variacionIngresos}% vs mes ant.` : null, icon: TrendingUp, color: variacionIngresos >= 0 ? 'text-green-400/70' : 'text-red-400/70' },
                  { label: 'Clientas', value: clientes.length, sub: null, icon: Users, color: 'text-purple-400/70' },
                ].map(({ label, value, sub, icon: Icon, color }) => (
                  <div key={label} className="card-dark">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-marfil/30 tracking-wider uppercase">{label}</p>
                      <Icon size={13} className={color} strokeWidth={1.5} />
                    </div>
                    <p className="font-cormorant text-3xl font-light">{value}</p>
                    {sub && <p className={`text-xs mt-1 ${color}`}>{sub}</p>}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="card-dark md:col-span-2">
                  <p className="text-xs text-marfil/40 tracking-widest uppercase mb-5">Ventas últimos 7 días</p>
                  <div className="flex items-end gap-2 h-28">
                    {ventasPorDia.map(v => (
                      <div key={v.key} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full relative group cursor-default">
                          <div className="w-full bg-dorado/20 hover:bg-dorado/40 transition-all rounded-sm"
                            style={{ height: `${Math.max((v.total / maxVenta) * 100, v.total > 0 ? 8 : 2)}px`, minHeight: '2px' }}
                            title={formatPrecio(v.total)} />
                        </div>
                        <span className="text-marfil/30 text-center leading-tight" style={{fontSize:'10px'}}>{v.label}</span>
                        {v.nCitas > 0 && <span className="text-dorado/50" style={{fontSize:'9px'}}>{v.nCitas}c</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-dark">
                  <p className="text-xs text-marfil/40 tracking-widest uppercase mb-4">Más vendidos</p>
                  {topProductos.length === 0
                    ? <p className="text-marfil/20 text-xs text-center py-4">Sin ventas aún</p>
                    : <div className="space-y-3">
                        {topProductos.map((p, i) => (
                          <div key={p.nombre} className="flex items-center gap-2">
                            <span className="text-dorado/40 font-cormorant text-base w-4">{i+1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs truncate">{p.nombre}</p>
                              <p className="text-marfil/30 text-xs">{p.cantidad} uds · {formatPrecio(p.ingresos)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                  }
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card-dark">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin size={12} className="text-dorado" strokeWidth={1.5} />
                    <p className="text-xs text-marfil/40 tracking-widest uppercase">Destinos de envío</p>
                  </div>
                  {topProvincias.length === 0
                    ? <p className="text-marfil/20 text-xs text-center py-4">Sin destinos aún</p>
                    : <div className="space-y-2">
                        {topProvincias.map(([prov, cant]) => {
                          const total = Object.values(conteoProvincias).reduce((a, b) => a + b, 0)
                          const pct = Math.round((cant / total) * 100)
                          return (
                            <div key={prov}>
                              <div className="flex justify-between text-xs mb-1"><span className="text-marfil/60">{prov}</span><span className="text-dorado">{cant} ({pct}%)</span></div>
                              <div className="h-1 bg-marfil/5"><div className="h-full bg-dorado/40" style={{width:`${pct}%`}} /></div>
                            </div>
                          )
                        })}
                      </div>
                  }
                </div>
                <div className="card-dark">
                  <p className="text-xs text-marfil/40 tracking-widest uppercase mb-4">Próximas citas</p>
                  <div className="space-y-2.5">
                    {citas.filter(c => c.estado === 'confirmada').slice(0, 5).map(c => (
                      <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-marfil/5">
                        <div><p className="text-sm">{c.cliente_nombre}</p><p className="text-marfil/40 text-xs capitalize">{c.tipo_evento}</p></div>
                        <div className="text-right"><p className="text-dorado text-xs">{c.fecha}</p><p className="text-marfil/40 text-xs">{formatHora(c.hora)}</p></div>
                      </div>
                    ))}
                    {citas.filter(c => c.estado === 'confirmada').length === 0 && <p className="text-marfil/25 text-xs text-center py-4">Sin citas programadas</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'citas' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h1 className="font-cormorant text-2xl italic">Citas</h1>
                <button onClick={() => cargar('citas')} className="flex items-center gap-2 text-marfil/40 text-xs hover:text-dorado transition-colors"><RefreshCw size={13} /> Actualizar</button>
              </div>
              <CalendarioCitas citas={citas} onActualizar={actualizarCita} clientes={clientes} />
            </div>
          )}

          {tab === 'pedidos' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h1 className="font-cormorant text-2xl italic">Pedidos</h1>
                <button onClick={() => exportCSV('pedidos')} className="flex items-center gap-1.5 text-xs text-marfil/40 hover:text-dorado border border-marfil/10 px-3 py-1.5 transition-all"><Download size={12} /> CSV</button>
              </div>
              <div className="flex gap-3 mb-5">
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-marfil/30" />
                  <input value={busquedaPedidos} onChange={e => setBusquedaPedidos(e.target.value)} placeholder="Buscar por número, nombre o email..." className="input-dark pl-9 text-xs py-2.5 w-full" />
                </div>
                <select value={filtroPedidoEstado} onChange={e => setFiltroPedidoEstado(e.target.value)} className="select-dark text-xs py-2.5 w-36">
                  <option value="">Todos los estados</option>
                  {['pendiente','pagado','preparando','enviado','entregado','cancelado'].map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="space-y-px">
                {pedidosMostrar.map(p => (
                  <div key={p.id} className={`card-dark ${p.estado === 'cancelado' ? 'opacity-50' : ''}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span className="text-dorado text-xs tracking-wider">{p.numero}</span>
                          <span className={`text-xs px-2 py-0.5 ${ESTADO_PEDIDO_COLORS[p.estado]}`}>{p.estado}</span>
                          {(p as any).mp_payment_id && <span className="text-marfil/20 text-xs">MP #{(p as any).mp_payment_id}</span>}
                        </div>
                        <p className="font-medium text-sm">{p.cliente_nombre}</p>
                        <p className="text-marfil/40 text-xs">{p.cliente_email} · {(p as any).cliente_telefono || ''}</p>
                        
                        {/* Dirección de envío */}
                        {(p as any).direccion_envio && (
                          <div className="mt-2 bg-negro3 border border-marfil/5 p-2.5">
                            <p className="text-xs text-marfil/30 uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin size={9} /> Envío</p>
                            <p className="text-sm">{(p as any).direccion_envio}</p>
                            <p className="text-marfil/50 text-xs">{(p as any).ciudad_envio}{(p as any).provincia_envio ? `, ${(p as any).provincia_envio}` : ''}{(p as any).codigo_postal ? ` · CP ${(p as any).codigo_postal}` : ''}</p>
                          </div>
                        )}
                        {!(p as any).direccion_envio && (p as any).provincia_envio && (
                          <p className="text-marfil/30 text-xs flex items-center gap-1 mt-0.5"><MapPin size={9} />{(p as any).provincia_envio}</p>
                        )}

                        {/* Productos */}
                        <div className="mt-2 space-y-0.5">{(p.items as any[]).map((item: any, i: number) => (
                          <p key={i} className="text-marfil/40 text-xs">{item.cantidad}x {item.nombre}{item.variante ? ` (${item.variante})` : ''}</p>
                        ))}</div>

                        {/* MercadoPago details */}
                        {(p as any).mp_payment_id && (
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                            {(p as any).mp_payment_method && <span className="text-marfil/25 text-xs">Método: {(p as any).mp_payment_method}</span>}
                            {(p as any).mp_status && <span className="text-marfil/25 text-xs">Status: {(p as any).mp_status}</span>}
                            {(p as any).mp_net_received && <span className="text-marfil/25 text-xs">Neto: {formatPrecio((p as any).mp_net_received)}</span>}
                            {(p as any).mp_fee_amount && <span className="text-marfil/25 text-xs">Comisión: {formatPrecio((p as any).mp_fee_amount)}</span>}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-cormorant text-xl">{formatPrecio(p.total)}</p>
                        {(p as any).costo_envio > 0 && <p className="text-marfil/30 text-xs">Envío: {formatPrecio((p as any).costo_envio)}</p>}
                        <p className="text-marfil/30 text-xs">{new Date(p.created_at).toLocaleDateString('es-AR')}</p>
                      </div>
                    </div>
                    {p.estado !== 'cancelado' ? (
                      <div className="mt-4 pt-4 border-t border-marfil/5">
                        <div className="flex items-center gap-0 flex-wrap">
                          {[{key:'pendiente',label:'Pendiente'},{key:'pagado',label:'Aceptado'},{key:'preparando',label:'Preparando'},{key:'enviado',label:'Enviado'},{key:'entregado',label:'Entregado'}].map((e, idx, arr) => {
                            const order = ['pendiente','pagado','preparando','enviado','entregado']
                            const posActual = order.indexOf(p.estado)
                            const posEste = order.indexOf(e.key)
                            const completado = posEste < posActual
                            const activo = e.key === p.estado
                            return (
                              <div key={e.key} className="flex items-center">
                                <button onClick={() => actualizarPedido(p.id, e.key)}
                                  className={`text-xs px-2.5 py-1.5 border transition-all ${activo ? 'border-dorado bg-dorado/15 text-dorado font-medium' : completado ? 'border-green-400/30 text-green-400/50' : 'border-marfil/10 text-marfil/25 hover:border-dorado/30 hover:text-dorado'}`}>
                                  {completado ? '✓ ' : ''}{e.label}
                                </button>
                                {idx < arr.length - 1 && <div className={`w-3 h-px ${completado ? 'bg-green-400/30' : 'bg-marfil/8'}`} />}
                              </div>
                            )
                          })}
                          {/* Ticket de envío */}
                          <button onClick={async () => {
                            try {
                              const res = await fetch('/api/pdf/ticket', { method: 'POST', headers: authHeaders(), body: JSON.stringify({
                                numero: p.numero, cliente_nombre: p.cliente_nombre, cliente_telefono: (p as any).cliente_telefono,
                                cliente_email: p.cliente_email, direccion_envio: (p as any).direccion_envio, ciudad_envio: (p as any).ciudad_envio,
                                provincia_envio: (p as any).provincia_envio, codigo_postal: (p as any).codigo_postal,
                                items: p.items, notas: (p as any).notas,
                              })})
                              const json = await res.json()
                              const w = window.open('', '_blank')
                              if (w) { w.document.write(json.html); w.document.close(); setTimeout(() => w.print(), 500) }
                            } catch (e: any) { toast.error(e.message) }
                          }} className="ml-2 text-xs px-2.5 py-1.5 border border-marfil/10 text-marfil/30 hover:border-dorado/30 hover:text-dorado transition-all flex items-center gap-1">
                            <Printer size={10} /> Ticket
                          </button>
                          <button onClick={() => cancelarPedido(p.id)} className="ml-auto text-xs px-2.5 py-1.5 border border-red-400/20 text-red-400/50 hover:bg-red-400/10 transition-all flex items-center gap-1"><XCircle size={10} /> Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 pt-3 border-t border-marfil/5 flex items-center justify-between">
                        <span className="text-red-400/50 text-xs">Cancelado</span>
                        <button onClick={() => ocultarPedidoCancelado(p.id)} className="text-xs text-marfil/25 hover:text-marfil/50 transition-colors flex items-center gap-1"><X size={10} /> Ocultar</button>
                      </div>
                    )}
                  </div>
                ))}
                {pedidosMostrar.length === 0 && <p className="text-center text-marfil/25 py-12">{busquedaPedidos ? 'Sin resultados' : 'No hay pedidos aún'}</p>}
              </div>
            </div>
          )}

          {tab === 'productos' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h1 className="font-cormorant text-2xl italic">Productos</h1>
                <div className="flex gap-2">
                  <button onClick={() => setShowNuevaCat(!showNuevaCat)} className="btn-ghost flex items-center gap-1.5 py-2 px-4 text-xs"><Tag size={12} /> Categorías</button>
                  <button onClick={() => { setProductoEditando(null); setNuevoProducto({ nombre:'', descripcion:'', precio:'', categoria: categorias[0]?.slug || 'batas', stock:'5', slug:'', imagenes:[], destacado:false }); setShowNuevoProducto(true) }}
                    className="btn-gold flex items-center gap-1.5 py-2 px-4 text-xs"><Plus size={12} /> Nuevo</button>
                </div>
              </div>
              {showNuevaCat && (
                <div className="card-dark mb-5 border border-dorado/15">
                  <p className="text-xs text-dorado tracking-widest uppercase mb-4">Gestión de categorías</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {categorias.map(c => (
                      <div key={c.id} className={`flex items-center gap-2 border px-3 py-1.5 ${c.default ? 'border-marfil/10 text-marfil/40' : 'border-dorado/20 text-dorado/70'}`}>
                        <span className="text-xs">{c.nombre}</span>
                        {!c.default && <button onClick={() => eliminarCategoria(c.id)} className="text-red-400/50 hover:text-red-400 transition-colors"><X size={11} /></button>}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <FormInput value={nuevaCatNombre} onChange={v => setNuevaCatNombre(v)} placeholder="Nueva categoría..." className="input-dark flex-1 text-xs py-2" />
                    <button onClick={crearCategoria} className="btn-gold px-4 text-xs py-2">Agregar</button>
                  </div>
                </div>
              )}
              {showNuevoProducto && (
                <div className="card-dark mb-5 border border-dorado/15">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-dorado tracking-widest uppercase">{productoEditando ? 'Editar producto' : 'Nuevo producto'}</p>
                    <button onClick={() => { setShowNuevoProducto(false); setProductoEditando(null) }}><X size={15} className="text-marfil/30" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Nombre *" value={nuevoProducto.nombre} onChange={v => setNuevoProducto(p => ({...p, nombre: v}))} placeholder="Ej: Tiara Perlas" />
                    <FormInput label="Precio ARS *" value={nuevoProducto.precio} onChange={v => setNuevoProducto(p => ({...p, precio: v}))} type="number" />
                    <FormInput label="Stock" value={nuevoProducto.stock} onChange={v => setNuevoProducto(p => ({...p, stock: v}))} type="number" />
                    <div>
                      <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Categoría</label>
                      <select value={nuevoProducto.categoria} onChange={e => setNuevoProducto(p => ({...p, categoria: e.target.value}))} className="select-dark w-full">
                        {categorias.map(c => <option key={c.id} value={c.slug}>{c.nombre}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <FormInput label="Descripción" value={nuevoProducto.descripcion} onChange={v => setNuevoProducto(p => ({...p, descripcion: v}))} rows={2} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Fotos del producto</label>
                      <div className="flex gap-2 flex-wrap">
                        {nuevoProducto.imagenes.map((img, idx) => (
                          <div key={idx} className="relative w-16 h-20">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button onClick={() => setNuevoProducto(p => ({...p, imagenes: p.imagenes.filter((_,i) => i !== idx)}))}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500/80 text-white flex items-center justify-center"><X size={9} /></button>
                          </div>
                        ))}
                        <button onClick={() => fileInputRef.current?.click()} disabled={subiendoFoto}
                          className="w-16 h-20 border border-dashed border-marfil/20 flex flex-col items-center justify-center gap-1 hover:border-dorado/40 transition-colors text-marfil/30 hover:text-dorado disabled:opacity-50">
                          {subiendoFoto ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                          <span style={{fontSize:'10px'}}>Foto</span>
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) subirFoto(e.target.files[0]); e.target.value='' }} />
                      </div>
                    </div>
                    <label className="col-span-2 flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={nuevoProducto.destacado} onChange={e => setNuevoProducto(p => ({...p, destacado: e.target.checked}))} className="accent-dorado w-4 h-4" />
                      <span className="text-sm flex items-center gap-1"><Star size={12} className="text-dorado" /> Marcar como destacado</span>
                    </label>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={crearProducto} className="btn-gold-fill flex-1 justify-center py-2.5 text-xs">{productoEditando ? 'Guardar' : 'Crear producto'}</button>
                    <button onClick={() => { setShowNuevoProducto(false); setProductoEditando(null) }} className="btn-ghost flex-1 justify-center py-2.5 text-xs">Cancelar</button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px">
                {productos.map(p => (
                  <div key={p.id} className={`card-dark ${!p.activo ? 'opacity-40' : ''}`}>
                    <div className="flex gap-3 mb-3">
                      {(p.imagenes || []).slice(0, 3).map((img, i) => (<img key={i} src={img} alt="" className="w-12 h-16 object-cover object-top flex-shrink-0" />))}
                      {(!p.imagenes || p.imagenes.length === 0) && <div className="w-12 h-16 bg-negro3 flex items-center justify-center flex-shrink-0"><Package size={16} className="text-marfil/15" strokeWidth={0.5} /></div>}
                      <div className="flex-1 min-w-0">
                        <p className="text-dorado text-xs uppercase tracking-wider mb-0.5">{p.categoria}</p>
                        <p className="font-medium text-sm">{p.nombre}</p>
                        <p className="font-cormorant text-lg">{formatPrecio(p.precio)}</p>
                        {p.destacado && <span className="text-dorado text-xs flex items-center gap-0.5"><Star size={10} fill="currentColor" /> Destacado</span>}
                        {!p.activo && <span className="text-red-400/70 text-xs flex items-center gap-0.5 mt-0.5"><Power size={10} /> Inactivo · oculto en la tienda</span>}
                      </div>
                    </div>
                    {p.descripcion && <p className="text-marfil/40 text-xs mb-3 line-clamp-2">{p.descripcion}</p>}
                    <div className="flex items-center justify-between pt-3 border-t border-marfil/5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-marfil/40">Stock:</span>
                        <input type="number" value={p.stock}
                          onChange={e => { const s = parseInt(e.target.value); fetch('/api/admin/productos',{method:'PATCH',headers:authHeaders(),body:JSON.stringify({id:p.id,stock:s})}); setProductos(ps => ps.map(x => x.id===p.id?{...x,stock:s}:x)) }}
                          className="w-14 bg-negro3 border border-marfil/10 text-marfil text-xs px-2 py-1 focus:outline-none focus:border-dorado/40" />
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => toggleDestacado(p.id, !p.destacado)} className={`text-xs px-2.5 py-1.5 border transition-all flex items-center gap-1 ${p.destacado ? 'border-dorado/30 text-dorado bg-dorado/8' : 'border-marfil/10 text-marfil/30 hover:border-dorado/30 hover:text-dorado'}`}><Star size={10} fill={p.destacado ? 'currentColor' : 'none'} /></button>
                        <button onClick={() => { const prod = p as any; setNuevoProducto({ nombre:prod.nombre, descripcion:prod.descripcion||'', precio:String(prod.precio), categoria:prod.categoria, stock:String(prod.stock), slug:prod.slug, imagenes:prod.imagenes||[], destacado:prod.destacado||false }); setProductoEditando(p.id); setShowNuevoProducto(true) }}
                          className="text-xs px-2.5 py-1.5 border border-dorado/20 text-dorado/60 hover:bg-dorado/10 transition-all">Editar</button>
                        <button onClick={() => toggleActivoProducto(p.id, !p.activo)}
                          title={p.activo ? 'Desactivar producto' : 'Activar producto'}
                          className={`text-xs px-2.5 py-1.5 border transition-all flex items-center gap-1 ${p.activo ? 'border-marfil/10 text-marfil/40 hover:border-red-400/30 hover:text-red-400/70' : 'border-green-400/30 text-green-400/70 bg-green-400/5 hover:bg-green-400/10'}`}>
                          <Power size={11} /> {p.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button onClick={() => eliminarProducto(p.id)} title="Eliminar producto definitivamente"
                          className="text-xs px-2.5 py-1.5 border border-red-400/20 text-red-400/50 hover:bg-red-400/10 transition-all"><Trash2 size={11} /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {productos.length === 0 && !cargando && <p className="text-marfil/25 text-sm py-12 col-span-2 text-center">No hay productos. Creá el primero.</p>}
              </div>
            </div>
          )}

          {tab === 'colecciones' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div><h1 className="font-cormorant text-2xl italic">Galerías & Colecciones</h1><p className="text-marfil/30 text-xs mt-0.5">Gestioná los vestidos que aparecen en cada galería del sitio</p></div>
                <button onClick={() => { setColeccionEditando(null); setNuevaColeccion({ nombre:'', descripcion:'', imagen_principal:'', imagenes:[], categoria:'novias', año:'2025', destacado:false, orden:'0' }); setShowNuevaColeccion(true) }}
                  className="btn-gold flex items-center gap-1.5 py-2 px-4 text-xs"><Plus size={12} /> Agregar diseño</button>
              </div>
              {showNuevaColeccion && (
                <div className="card-dark mb-5 border border-dorado/15">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-dorado tracking-widest uppercase">{coleccionEditando ? 'Editar diseño' : 'Nuevo diseño'}</p>
                    <button onClick={() => { setShowNuevaColeccion(false); setColeccionEditando(null) }}><X size={15} className="text-marfil/30" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Nombre *" value={nuevaColeccion.nombre} onChange={v => setNuevaColeccion(c => ({...c, nombre: v}))} placeholder="Ej: Sirena Aquamarina" />
                    <div>
                      <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Categoría *</label>
                      <select value={nuevaColeccion.categoria} onChange={e => setNuevaColeccion(c => ({...c, categoria: e.target.value}))} className="select-dark w-full">
                        <option value="novias">Novias</option><option value="quinceaneras">Quinceañeras</option><option value="gala">Gala</option><option value="miss">Miss</option>
                      </select>
                    </div>
                    <FormInput label="Año" value={nuevaColeccion.año} onChange={v => setNuevaColeccion(c => ({...c, año: v}))} type="number" />
                    <FormInput label="Orden" value={nuevaColeccion.orden} onChange={v => setNuevaColeccion(c => ({...c, orden: v}))} type="number" />
                    <div className="col-span-2">
                      <FormInput label="Descripción" value={nuevaColeccion.descripcion} onChange={v => setNuevaColeccion(c => ({...c, descripcion: v}))} rows={2} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Foto principal *</label>
                      {nuevaColeccion.imagen_principal
                        ? <div className="relative w-28 h-36 group">
                            <img src={nuevaColeccion.imagen_principal} alt="" className="w-full h-full object-cover" />
                            <button onClick={() => setNuevaColeccion(c => ({...c, imagen_principal:''}))} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500/80 text-white flex items-center justify-center"><X size={10} /></button>
                          </div>
                        : <button onClick={() => fileInputColRef.current?.click()} disabled={subiendoFotoCol}
                            className="w-28 h-36 border border-dashed border-marfil/20 flex flex-col items-center justify-center gap-2 hover:border-dorado/40 transition-colors text-marfil/30 hover:text-dorado disabled:opacity-50">
                            {subiendoFotoCol ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                            <span className="text-xs">{subiendoFotoCol ? 'Subiendo...' : 'Subir foto'}</span>
                          </button>
                      }
                      <input ref={fileInputColRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) subirFotoColeccion(e.target.files[0]); e.target.value='' }} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Fotos adicionales — slider</label>
                      <div className="flex gap-2 flex-wrap">
                        {(nuevaColeccion.imagenes || []).map((img, idx) => (
                          <div key={idx} className="relative w-20 h-28 flex-shrink-0">
                            <img src={img} alt="" className="w-full h-full object-cover object-top" />
                            <button onClick={() => setNuevaColeccion(c => ({ ...c, imagenes: (c.imagenes || []).filter((_, i) => i !== idx) }))}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500/80 text-white flex items-center justify-center"><X size={10} /></button>
                          </div>
                        ))}
                        <label className="w-20 h-28 border border-dashed border-marfil/20 flex flex-col items-center justify-center gap-1 hover:border-dorado/40 transition-colors text-marfil/30 hover:text-dorado cursor-pointer flex-shrink-0">
                          {subiendoFotoCol ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />}
                          <span style={{ fontSize: '10px' }}>{subiendoFotoCol ? 'Subiendo' : 'Agregar'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={async e => {
                            if (!e.target.files?.[0]) return
                            const file = e.target.files[0]
                            setSubiendoFotoCol(true)
                            const reader = new FileReader()
                            reader.readAsDataURL(file)
                            reader.onload = async () => {
                              const token = sessionStorage.getItem('admin_token') || ''
                              const res = await fetch('/api/admin/upload', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, body: JSON.stringify({ base64: reader.result, nombre: file.name }) })
                              const json = await res.json()
                              if (res.ok && json.url) { setNuevaColeccion(c => ({ ...c, imagenes: [...(c.imagenes || []), json.url] })); toast.success('Foto adicional subida') }
                              else toast.error('Error al subir')
                              setSubiendoFotoCol(false)
                            }
                            e.target.value = ''
                          }} />
                        </label>
                      </div>
                      <p className="text-marfil/20 text-xs mt-1.5">Al hacer clic en el vestido se abre un slider con todas las fotos</p>
                    </div>
                    <div className="col-span-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={nuevaColeccion.destacado} onChange={e => setNuevaColeccion(c => ({...c, destacado: e.target.checked}))} className="accent-dorado w-4 h-4" />
                        <span className="text-sm">Marcar como destacado</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={crearColeccion} className="btn-gold-fill flex-1 justify-center py-2.5 text-xs">{coleccionEditando ? 'Guardar' : 'Agregar'}</button>
                    <button onClick={() => { setShowNuevaColeccion(false); setColeccionEditando(null) }} className="btn-ghost flex-1 justify-center py-2.5 text-xs">Cancelar</button>
                  </div>
                </div>
              )}
              {['novias','quinceaneras','gala','miss'].map(cat => {
                const items = colecciones.filter(c => c.categoria === cat)
                const labels: Record<string,string> = { novias:'Novias', quinceaneras:'Quinceañeras', gala:'Gala & Cóctel', miss:'Miss & Certámenes' }
                return (
                  <div key={cat} className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                      <p className="text-dorado text-xs tracking-widest uppercase">{labels[cat]}</p>
                      <span className="text-marfil/20 text-xs">{items.length} diseños</span>
                    </div>
                    {items.length === 0 ? <p className="text-marfil/20 text-xs py-3">Sin diseños en esta categoría.</p> : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-px">
                        {items.map(c => (
                          <div key={c.id} className={`relative group ${!c.activo ? 'opacity-40' : ''}`}>
                            <div className="overflow-hidden bg-negro3" style={{aspectRatio:'2/3'}}>
                              <img src={c.imagen_principal} alt={c.nombre} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" style={{filter:'brightness(0.6)'}} />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-negro/90 via-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <p className="text-marfil text-xs font-medium truncate">{c.nombre}</p>
                              <p className="text-marfil/40 text-xs">{c.año}{c.destacado ? ' ⭐' : ''}</p>
                            </div>
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setNuevaColeccion({nombre:c.nombre,descripcion:c.descripcion||'',imagen_principal:c.imagen_principal,imagenes:c.imagenes||[],categoria:c.categoria,año:String(c.año||2025),destacado:c.destacado||false,orden:String(c.orden||0)}); setColeccionEditando(c.id); setShowNuevaColeccion(true) }}
                                className="bg-negro/80 text-dorado px-2 py-1 text-xs hover:bg-negro transition-colors">Editar</button>
                              <button onClick={() => eliminarColeccion(c.id)} className="bg-red-600/80 text-white px-1.5 py-1 text-xs hover:bg-red-600 transition-colors"><Trash2 size={10} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {tab === 'clientes' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div><h1 className="font-cormorant text-2xl italic">Clientas</h1><p className="text-marfil/30 text-xs mt-0.5">Se registran automáticamente al agendar citas</p></div>
                <div className="flex gap-2">
                  <button onClick={() => exportCSV('clientes')} className="flex items-center gap-1.5 text-xs text-marfil/40 hover:text-dorado border border-marfil/10 px-3 py-1.5 transition-all"><Download size={12} /> CSV</button>
                  <button onClick={() => setShowNuevoCliente(!showNuevoCliente)} className="btn-gold flex items-center gap-1.5 py-2 px-4 text-xs"><Plus size={12} /> Nueva</button>
                </div>
              </div>
              {showNuevoCliente && (
                <div className="card-dark mb-5 border border-dorado/15">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-dorado tracking-widest uppercase">Nueva clienta</p>
                    <button onClick={() => setShowNuevoCliente(false)}><X size={15} className="text-marfil/30" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Nombre *" value={nuevoCliente.nombre} onChange={v => setNuevoCliente(c => ({...c, nombre: v}))} />
                    <FormInput label="Email *" value={nuevoCliente.email} onChange={v => setNuevoCliente(c => ({...c, email: v}))} type="email" />
                    <FormInput label="Teléfono" value={nuevoCliente.telefono} onChange={v => setNuevoCliente(c => ({...c, telefono: v}))} />
                    <div>
                      <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Tipo de evento</label>
                      <select value={nuevoCliente.tipo_evento_habitual} onChange={e => setNuevoCliente(c => ({...c, tipo_evento_habitual: e.target.value}))} className="select-dark w-full">
                        <option value="">Seleccionar</option>
                        {['novia','quinceanera','gala','miss','otro'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={crearCliente} className="btn-gold-fill flex-1 justify-center py-2.5 text-xs">Agregar clienta</button>
                    <button onClick={() => setShowNuevoCliente(false)} className="btn-ghost flex-1 justify-center py-2.5 text-xs">Cancelar</button>
                  </div>
                </div>
              )}
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-marfil/30" />
                  <input value={busquedaClientes} onChange={e => setBusquedaClientes(e.target.value)} placeholder="Buscar por nombre, email o teléfono..." className="input-dark pl-9 text-xs py-2.5 w-full" />
                </div>
                <select value={filtroClientes} onChange={e => setFiltroClientes(e.target.value)} className="select-dark text-xs py-2.5 w-40">
                  <option value="">Todos los eventos</option>
                  {['novia','quinceanera','gala','miss','otro'].map(e => <option key={e} value={e} className="capitalize">{e}</option>)}
                </select>
              </div>
              <div className="space-y-px">
                {clientesMostrar.map(c => (
                  <div key={c.id} className="card-dark flex flex-wrap items-center gap-4 cursor-pointer hover:border-dorado/15 transition-colors"
                    onClick={() => router.push(`/admin/clientas/${c.id}`)}>
                    <div className="w-10 h-10 bg-dorado/10 border border-dorado/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-cormorant text-lg text-dorado">{c.nombre?.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{c.nombre}</p>
                      <p className="text-marfil/40 text-xs">{c.email} · {c.telefono}</p>
                      {(c.ciudad || c.provincia) && <p className="text-marfil/30 text-xs flex items-center gap-1 mt-0.5"><MapPin size={9} />{c.ciudad}{c.provincia?`, ${c.provincia}`:''}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-dorado text-xs">{c.total_citas||0} cita{c.total_citas!==1?'s':''}</p>
                      <p className="text-marfil/30 text-xs capitalize">{c.tipo_evento_habitual||'—'}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      {c.telefono && <a href={`https://wa.me/${c.telefono.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                        className="border border-marfil/10 text-marfil/40 hover:border-green-400/40 hover:text-green-400 px-3 py-1.5 text-xs transition-all">WA</a>}
                      <button onClick={() => router.push(`/admin/clientas/${c.id}`)} className="border border-dorado/20 text-dorado/60 hover:bg-dorado/10 px-3 py-1.5 text-xs transition-all">Ficha</button>
                      <button onClick={() => eliminarCliente(c.id)} className="border border-red-400/15 text-red-400/40 hover:bg-red-400/10 px-2 py-1.5 text-xs transition-all"><Trash2 size={11} /></button>
                    </div>
                  </div>
                ))}
                {clientesMostrar.length === 0 && <p className="text-center text-marfil/25 py-12">{busquedaClientes ? 'Sin resultados' : 'No hay clientas registradas aún'}</p>}
              </div>
            </div>
          )}

          {tab === 'horarios' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div><h1 className="font-cormorant text-2xl italic">Horarios Bloqueados</h1><p className="text-marfil/30 text-xs mt-0.5">Lunes a Viernes 11:00 — 18:00 hs · Sábados 11:00 — 16:00 hs</p></div>
                <button onClick={() => setShowNuevoHorario(!showNuevoHorario)} className="btn-gold flex items-center gap-1.5 py-2 px-4 text-xs"><Plus size={12} /> Bloquear</button>
              </div>
              {showNuevoHorario && (
                <div className="card-dark mb-5 border border-dorado/15">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-dorado tracking-widest uppercase">Bloquear horario</p>
                    <button onClick={() => setShowNuevoHorario(false)}><X size={15} className="text-marfil/30" /></button>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input type="checkbox" checked={bloqueoPorRango} onChange={e => setBloqueoPorRango(e.target.checked)} className="accent-dorado w-4 h-4" />
                    <span className="text-sm">Bloquear rango de fechas (ej: vacaciones)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">{bloqueoPorRango ? 'Desde' : 'Fecha'} *</label>
                      <input type="date" value={nuevoHorario.fecha} onChange={e => setNuevoHorario(h => ({...h, fecha: e.target.value}))} className="input-dark" />
                    </div>
                    {bloqueoPorRango && <div>
                      <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Hasta *</label>
                      <input type="date" value={nuevoHorario.fecha_fin} onChange={e => setNuevoHorario(h => ({...h, fecha_fin: e.target.value}))} className="input-dark" />
                    </div>}
                    <FormInput label="Motivo" value={nuevoHorario.motivo} onChange={v => setNuevoHorario(h => ({...h, motivo: v}))} placeholder="Vacaciones, feriado..." />
                    {!bloqueoPorRango && <div />}
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer mt-3">
                    <input type="checkbox" checked={nuevoHorario.todo_el_dia} onChange={e => setNuevoHorario(h => ({...h, todo_el_dia: e.target.checked}))} className="accent-dorado w-4 h-4" />
                    <span className="text-sm">Bloquear todo el día</span>
                  </label>
                  {!nuevoHorario.todo_el_dia && (
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div><label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Desde</label><input type="time" value={nuevoHorario.hora_inicio} onChange={e => setNuevoHorario(h => ({...h, hora_inicio: e.target.value}))} className="input-dark" /></div>
                      <div><label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Hasta</label><input type="time" value={nuevoHorario.hora_fin_hora} onChange={e => setNuevoHorario(h => ({...h, hora_fin_hora: e.target.value}))} className="input-dark" /></div>
                    </div>
                  )}
                  <div className="flex gap-3 mt-4">
                    <button onClick={bloquearHorario} className="btn-gold-fill flex-1 justify-center py-2.5 text-xs">Bloquear{bloqueoPorRango ? ' rango' : ''}</button>
                    <button onClick={() => setShowNuevoHorario(false)} className="btn-ghost flex-1 justify-center py-2.5 text-xs">Cancelar</button>
                  </div>
                </div>
              )}
              <div className="space-y-px">
                {horarios.map(h => (
                  <div key={h.id} className="card-dark flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{h.fecha}</p>
                      <p className="text-marfil/40 text-xs mt-0.5">
                        {h.todo_el_dia ? 'Todo el día' : `${h.hora_inicio?.substring(0,5)} — ${h.hora_fin?.substring(0,5)}`}
                        {h.motivo ? ` · ${h.motivo}` : ''}
                      </p>
                    </div>
                    <button onClick={() => desbloquearHorario(h.id)} className="text-red-400/50 hover:text-red-400/80 transition-colors"><Trash2 size={14} strokeWidth={1.5} /></button>
                  </div>
                ))}
                {horarios.length === 0 && !cargando && <p className="text-center text-marfil/25 py-12">No hay horarios bloqueados</p>}
              </div>
            </div>
          )}

          {tab === 'sitio' && (() => {
            const PORTADAS = [
              { campo: 'portada_novias', label: 'Portada · Novias', fallback: '/images/cat-novias.jpg' },
              { campo: 'portada_quinceaneras', label: 'Portada · Quinceañeras', fallback: '/images/cat-quinces.jpg' },
              { campo: 'portada_gala', label: 'Portada · Gala & Cóctel', fallback: '/images/cat-gala.jpg' },
              { campo: 'portada_miss', label: 'Portada · Miss & Certámenes', fallback: '/images/cat-miss.jpg' },
            ]
            const IG_FALLBACKS = ['/images/hero.jpg','/images/cat-miss.jpg','/images/cat-quinces.jpg','/images/cat-gala.jpg','/images/cat-novias.jpg','/images/cta-bg.jpg']
            const igActuales: string[] = Array.isArray(configSitio.instagram_imagenes) ? configSitio.instagram_imagenes : []

            return (
              <div>
                <div className="mb-6">
                  <h1 className="font-cormorant text-2xl italic">Imágenes del Sitio</h1>
                  <p className="text-marfil/30 text-xs mt-0.5">Cambiá el hero, las portadas de colecciones y la grilla de Instagram sin tocar código. Los cambios se ven al instante en la web.</p>
                </div>

                {/* Hero */}
                <div className="card-dark mb-6">
                  <p className="text-xs text-dorado tracking-widest uppercase mb-3">Hero · Portada principal</p>
                  <label className="relative block cursor-pointer group overflow-hidden border border-marfil/10" style={{ aspectRatio: '16/7' }}>
                    <img src={configSitio.hero_imagen || '/images/hero.jpg'} alt="Hero" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-negro/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {subiendoImgSitio === 'hero_imagen' ? <RefreshCw size={16} className="animate-spin text-marfil" /> : <Upload size={16} className="text-marfil" />}
                      <span className="text-xs text-marfil">Cambiar foto</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) subirImagenSitio('hero_imagen', e.target.files[0]); e.target.value = '' }} />
                  </label>
                </div>

                {/* Portadas de colecciones */}
                <div className="card-dark mb-6">
                  <p className="text-xs text-dorado tracking-widest uppercase mb-3">Portadas de Colecciones</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {PORTADAS.map(p => (
                      <div key={p.campo}>
                        <label className="relative block cursor-pointer group overflow-hidden border border-marfil/10" style={{ aspectRatio: '2/3' }}>
                          <img src={configSitio[p.campo] || p.fallback} alt={p.label} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-negro/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            {subiendoImgSitio === p.campo ? <RefreshCw size={14} className="animate-spin text-marfil" /> : <Upload size={14} className="text-marfil" />}
                          </div>
                          <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) subirImagenSitio(p.campo, e.target.files[0]); e.target.value = '' }} />
                        </label>
                        <p className="text-xs text-marfil/40 mt-1.5 text-center">{p.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instagram */}
                <div className="card-dark">
                  <p className="text-xs text-dorado tracking-widest uppercase mb-3">Grilla de Instagram (portada)</p>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {IG_FALLBACKS.map((fallback, idx) => (
                      <label key={idx} className="relative block cursor-pointer group overflow-hidden border border-marfil/10 aspect-square">
                        <img src={igActuales[idx] || fallback} alt={`Instagram ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-negro/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          {subiendoImgSitio === `instagram-${idx}` ? <RefreshCw size={14} className="animate-spin text-marfil" /> : <Upload size={14} className="text-marfil" />}
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) subirImagenInstagram(idx, e.target.files[0]); e.target.value = '' }} />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}

        </div>
      </main>
    </div>
  )
}