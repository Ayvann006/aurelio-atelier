'use client'
import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Clock, User, Phone, Mail, Calendar, Tag, Plus, Loader2, Search } from 'lucide-react'
import { getHorariosDisponibles } from '@/lib/utils'
import { toast } from 'sonner'
import type { Cita } from '@/types'

type Vista = 'mes' | 'semana' | 'dia'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS_CORTO = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const HORAS_DIA = ['11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']

const COLORES_EVENTO: Record<string, string> = {
  novia: 'bg-pink-500/20 border-pink-500/40 text-pink-300',
  quinceanera: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
  gala: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
  miss: 'bg-dorado/20 border-dorado/40 text-dorado',
  otro: 'bg-marfil/10 border-marfil/20 text-marfil/60',
}

const LABELS_EVENTO: Record<string, string> = {
  novia: 'Novia', quinceanera: 'Quinceañera', gala: 'Gala', miss: 'Miss', otro: 'Otro'
}

interface Props {
  citas: Cita[]
  onActualizar: (id: string, estado: string) => void
  clientes?: any[]
}

export default function CalendarioCitas({ citas, onActualizar, clientes = [] }: Props) {
  const hoy = new Date()
  const [vista, setVista] = useState<Vista>('mes')
  const [fecha, setFecha] = useState(hoy)
  const [citaSel, setCitaSel] = useState<Cita | null>(null)

  // Nueva cita desde calendario
  const [modalNueva, setModalNueva] = useState(false)
  const [fechaNueva, setFechaNueva] = useState('')
  const [horaNueva, setHoraNueva] = useState('')
  const [horasDisp, setHorasDisp] = useState<string[]>([])
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [clienteSel, setClienteSel] = useState<any>(null)
  const [esNuevoCliente, setEsNuevoCliente] = useState(false)
  const [formNueva, setFormNueva] = useState({
    cliente_nombre: '', cliente_email: '', cliente_telefono: '',
    tipo_evento: 'novia', tipo_cita: 'primera-entrevista', notas: ''
  })
  const [agendando, setAgendando] = useState(false)

  function getToken() { return sessionStorage.getItem('admin_token') || '' }

  async function abrirNuevaCita(f?: string) {
    setFechaNueva(f || '')
    setHoraNueva('')
    setClienteSel(null)
    setBusquedaCliente('')
    setEsNuevoCliente(false)
    setFormNueva({ cliente_nombre:'', cliente_email:'', cliente_telefono:'', tipo_evento:'novia', tipo_cita:'primera-entrevista', notas:'' })
    if (f) {
      const res = await fetch(`/api/disponibilidad?fecha=${f}`)
      const data = await res.json()
      setHorasDisp(data.disponibles || [])
    }
    setModalNueva(true)
  }

  async function cargarHoras(f: string) {
    if (!f) return
    const res = await fetch(`/api/disponibilidad?fecha=${f}`)
    const data = await res.json()
    setHorasDisp(data.disponibles || [])
  }

  function seleccionarCliente(c: any) {
    setClienteSel(c)
    setFormNueva(f => ({ ...f, cliente_nombre: c.nombre, cliente_email: c.email, cliente_telefono: c.telefono || '' }))
    setBusquedaCliente(c.nombre)
  }

  async function confirmarCita() {
    if (!fechaNueva || !horaNueva || !formNueva.cliente_nombre || !formNueva.cliente_email) {
      toast.error('Completá fecha, hora, nombre y email'); return
    }
    setAgendando(true)
    try {
      const res = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formNueva, fecha: fechaNueva, hora: horaNueva }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Cita agendada correctamente')
      setModalNueva(false)
      // Refresh citas
      window.location.reload()
    } catch (e: any) {
      toast.error(e.message)
    } finally { setAgendando(false) }
  }

  function navegar(dir: -1 | 1) {
    const d = new Date(fecha)
    if (vista === 'mes') d.setMonth(d.getMonth() + dir)
    else if (vista === 'semana') d.setDate(d.getDate() + dir * 7)
    else d.setDate(d.getDate() + dir)
    setFecha(d)
  }

  function dateStr(d: Date) { return d.toISOString().split('T')[0] }

  function citasEnFecha(f: string) {
    return citas.filter(c => c.fecha === f && c.estado !== 'cancelada')
  }

  const titulo = useMemo(() => {
    if (vista === 'mes') return `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`
    if (vista === 'semana') {
      const lunes = new Date(fecha); lunes.setDate(fecha.getDate() - ((fecha.getDay() + 6) % 7))
      const sab = new Date(lunes); sab.setDate(lunes.getDate() + 5)
      return `${lunes.getDate()} — ${sab.getDate()} ${MESES[sab.getMonth()]} ${sab.getFullYear()}`
    }
    return `${DIAS_CORTO[fecha.getDay()]} ${fecha.getDate()} de ${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`
  }, [fecha, vista])

  const diasMes = useMemo(() => {
    const primero = new Date(fecha.getFullYear(), fecha.getMonth(), 1)
    const ultimo = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0)
    const dias = []
    const offset = (primero.getDay() + 6) % 7
    for (let i = 0; i < offset; i++) { const d = new Date(primero); d.setDate(d.getDate() - (offset - i)); dias.push({ fecha: dateStr(d), fuera: true }) }
    for (let i = 1; i <= ultimo.getDate(); i++) { const d = new Date(fecha.getFullYear(), fecha.getMonth(), i); dias.push({ fecha: dateStr(d), fuera: false }) }
    while (dias.length % 7 !== 0) { const d = new Date(ultimo); d.setDate(ultimo.getDate() + (dias.length - ultimo.getDate())); dias.push({ fecha: dateStr(d), fuera: true }) }
    return dias
  }, [fecha])

  const diasSemana = useMemo(() => {
    const lunes = new Date(fecha); lunes.setDate(fecha.getDate() - ((fecha.getDay() + 6) % 7))
    return Array.from({ length: 6 }, (_, i) => { const d = new Date(lunes); d.setDate(lunes.getDate() + i); return { fecha: dateStr(d), d } })
  }, [fecha])

  const clientesFiltrados = clientes.filter(c => {
    const q = busquedaCliente.toLowerCase()
    return !q || c.nombre?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.telefono?.includes(q)
  }).slice(0, 5)

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => navegar(-1)} className="text-marfil/40 hover:text-dorado transition-colors p-1.5 border border-marfil/10 hover:border-dorado/30"><ChevronLeft size={15} strokeWidth={1.5} /></button>
          <h2 className="font-cormorant text-lg capitalize min-w-[180px] text-center">{titulo}</h2>
          <button onClick={() => navegar(1)} className="text-marfil/40 hover:text-dorado transition-colors p-1.5 border border-marfil/10 hover:border-dorado/30"><ChevronRight size={15} strokeWidth={1.5} /></button>
          <button onClick={() => setFecha(new Date())} className="text-xs px-3 py-1.5 border border-marfil/10 text-marfil/40 hover:border-dorado/30 hover:text-dorado transition-all">Hoy</button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => abrirNuevaCita()} className="btn-gold flex items-center gap-1.5 py-1.5 px-4 text-xs"><Plus size={12} /> Nueva cita</button>
          <div className="flex gap-0 border border-marfil/10 p-0.5">
            {(['mes','semana','dia'] as Vista[]).map(v => (
              <button key={v} onClick={() => setVista(v)}
                className={`text-xs px-3 py-1.5 capitalize transition-all ${vista === v ? 'bg-dorado/15 text-dorado' : 'text-marfil/40 hover:text-marfil/70'}`}>
                {v === 'dia' ? 'Día' : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VISTA MES */}
      {vista === 'mes' && (
        <div className="border border-marfil/8">
          <div className="grid grid-cols-7 border-b border-marfil/8">
            {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
              <div key={d} className="py-2 text-center text-xs text-marfil/30 tracking-wider uppercase">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {diasMes.map(({ fecha: f, fuera }, i) => {
              const cs = citasEnFecha(f)
              const esHoy = f === dateStr(hoy)
              const dow = new Date(f + 'T00:00:00').getDay()
              const esDomingo = dow === 0
              return (
                <div key={i} className={`min-h-[80px] p-1.5 border-b border-r border-marfil/5 ${fuera||esDomingo ? 'bg-negro3/30' : ''} ${i%7===6?'border-r-0':''} group`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className={`text-xs w-6 h-6 flex items-center justify-center rounded-full ${esHoy ? 'bg-dorado text-negro font-medium' : fuera||esDomingo ? 'text-marfil/15' : 'text-marfil/50'}`}>
                      {parseInt(f.split('-')[2])}
                    </div>
                    {!fuera && !esDomingo && (
                      <button onClick={() => abrirNuevaCita(f)} className="opacity-0 group-hover:opacity-100 transition-opacity text-marfil/30 hover:text-dorado">
                        <Plus size={11} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {cs.slice(0, 2).map(c => (
                      <button key={c.id} onClick={() => setCitaSel(c)}
                        className={`w-full text-left px-1.5 py-0.5 text-xs border truncate transition-all hover:opacity-80 ${COLORES_EVENTO[c.tipo_evento]} ${!c.sena_pagada ? 'opacity-70' : ''}`}>
                        {c.hora.substring(0,5)} {c.cliente_nombre.split(' ')[0]}
                        {!c.sena_pagada && ' ○'}
                      </button>
                    ))}
                    {cs.length > 2 && <p className="text-marfil/30 text-xs pl-1">+{cs.length-2}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* VISTA SEMANA */}
      {vista === 'semana' && (
        <div className="border border-marfil/8 overflow-x-auto">
          <div className="grid min-w-[600px]" style={{gridTemplateColumns:'52px repeat(6, 1fr)'}}>
            <div className="border-b border-r border-marfil/8" />
            {diasSemana.map(({ fecha: f, d }) => {
              const esHoy = f === dateStr(hoy)
              return (
                <div key={f} className={`py-2 px-2 border-b border-r border-marfil/8 text-center ${esHoy ? 'bg-dorado/5' : ''}`}>
                  <p className="text-xs text-marfil/30 uppercase">{DIAS_CORTO[d.getDay()]}</p>
                  <p className={`text-lg font-cormorant ${esHoy ? 'text-dorado' : 'text-marfil/60'}`}>{d.getDate()}</p>
                </div>
              )
            })}
            {HORAS_DIA.map(hora => (
              <>
                <div key={`h-${hora}`} className="border-b border-r border-marfil/5 py-2 px-2 text-right">
                  <span className="text-xs text-marfil/20">{hora}</span>
                </div>
                {diasSemana.map(({ fecha: f }) => {
                  const cita = citas.find(c => c.fecha === f && c.hora.startsWith(hora.split(':')[0]+':') && c.estado !== 'cancelada')
                  const esHoy = f === dateStr(hoy)
                  return (
                    <div key={`${f}-${hora}`} className={`border-b border-r border-marfil/5 min-h-[48px] p-1 relative group ${esHoy ? 'bg-dorado/3' : ''}`}>
                      {cita ? (
                        <button onClick={() => setCitaSel(cita)}
                          className={`w-full text-left p-1.5 border text-xs ${COLORES_EVENTO[cita.tipo_evento]} hover:opacity-80 transition-opacity`}>
                          <p className="font-medium truncate">{cita.cliente_nombre.split(' ')[0]}</p>
                          <p className="opacity-60 text-xs">{LABELS_EVENTO[cita.tipo_evento]}</p>
                        </button>
                      ) : (
                        <button onClick={() => abrirNuevaCita(f)} className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Plus size={12} className="text-marfil/20" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </>
            ))}
          </div>
        </div>
      )}

      {/* VISTA DÍA */}
      {vista === 'dia' && (
        <div className="border border-marfil/8">
          <div className="border-b border-marfil/8 py-3 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="font-cormorant text-lg">{dateStr(fecha) === dateStr(hoy) ? 'Hoy' : ''}</p>
              {citasEnFecha(dateStr(fecha)).length > 0
                ? <p className="text-dorado text-sm">{citasEnFecha(dateStr(fecha)).length} cita(s)</p>
                : <p className="text-marfil/30 text-sm">Sin citas</p>}
            </div>
            <button onClick={() => abrirNuevaCita(dateStr(fecha))} className="btn-gold flex items-center gap-1 py-1.5 px-3 text-xs"><Plus size={11} /> Agendar</button>
          </div>
          <div className="divide-y divide-marfil/5">
            {HORAS_DIA.map(hora => {
              const cita = citas.find(c => c.fecha === dateStr(fecha) && c.hora.startsWith(hora.split(':')[0]+':') && c.estado !== 'cancelada')
              return (
                <div key={hora} className="flex gap-4 p-3 min-h-[56px] group">
                  <span className="text-xs text-marfil/20 w-10 pt-1 flex-shrink-0">{hora}</span>
                  {cita ? (
                    <button onClick={() => setCitaSel(cita)}
                      className={`flex-1 text-left p-3 border ${COLORES_EVENTO[cita.tipo_evento]} hover:opacity-80 transition-opacity`}>
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{cita.cliente_nombre}</p>
                        <span className="text-xs opacity-60">{LABELS_EVENTO[cita.tipo_evento]} · {cita.tipo_cita}</span>
                      </div>
                      <p className="text-xs opacity-60 mt-0.5">{cita.cliente_telefono}</p>
                    </button>
                  ) : (
                    <button onClick={() => { setFechaNueva(dateStr(fecha)); setHoraNueva(hora); abrirNuevaCita(dateStr(fecha)) }}
                      className="flex-1 border border-dashed border-marfil/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-marfil/20">
                      <Plus size={12} className="mr-1" /> Agendar
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div className="flex gap-2 flex-wrap items-center">
        {Object.entries(LABELS_EVENTO).map(([k, v]) => (
          <div key={k} className={`flex items-center gap-1.5 text-xs px-2 py-1 border ${COLORES_EVENTO[k]}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />{v}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-marfil/30 ml-2">
          <span>○ = sin seña</span>
        </div>
      </div>

      {/* Modal detalle cita */}
      {citaSel && (
        <div className="fixed inset-0 z-50 bg-negro/90 flex items-center justify-center p-6" style={{backdropFilter:'blur(8px)'}}>
          <div className="bg-negro2 border border-marfil/10 max-w-md w-full p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className={`text-xs px-2 py-0.5 border ${COLORES_EVENTO[citaSel.tipo_evento]}`}>{LABELS_EVENTO[citaSel.tipo_evento]}</span>
                <h3 className="font-cormorant text-2xl italic mt-2">{citaSel.cliente_nombre}</h3>
              </div>
              <button onClick={() => setCitaSel(null)} className="text-marfil/30 hover:text-marfil text-xl">✕</button>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm"><Calendar size={13} className="text-dorado flex-shrink-0" strokeWidth={1.5} /><span className="text-marfil/70">{citaSel.fecha} a las {citaSel.hora.substring(0,5)} hs</span></div>
              <div className="flex items-center gap-3 text-sm"><Tag size={13} className="text-dorado flex-shrink-0" strokeWidth={1.5} /><span className="text-marfil/70 capitalize">{citaSel.tipo_cita?.replace(/-/g,' ')}</span></div>
              <div className="flex items-center gap-3 text-sm"><Phone size={13} className="text-dorado flex-shrink-0" strokeWidth={1.5} />
                <a href={`https://wa.me/${citaSel.cliente_telefono.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="text-marfil/70 hover:text-dorado transition-colors">{citaSel.cliente_telefono}</a>
              </div>
              <div className="flex items-center gap-3 text-sm"><Mail size={13} className="text-dorado flex-shrink-0" strokeWidth={1.5} /><span className="text-marfil/70">{citaSel.cliente_email}</span></div>
              {citaSel.notas && <div className="bg-negro3 p-3 border border-marfil/5 text-sm text-marfil/50 italic">"{citaSel.notas}"</div>}
              {citaSel.sena_pagada && <div className="text-green-400/70 text-sm">✓ Seña abonada</div>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {citaSel.estado !== 'completada' && <button onClick={() => { onActualizar(citaSel.id,'completada'); setCitaSel(null) }} className="border border-green-400/20 text-green-400/60 hover:bg-green-400/10 py-2 text-xs transition-all">✓ Completada</button>}
              {citaSel.estado !== 'cancelada' && <button onClick={() => { onActualizar(citaSel.id,'cancelada'); setCitaSel(null) }} className="border border-red-400/20 text-red-400/50 hover:bg-red-400/10 py-2 text-xs transition-all">✕ Cancelar</button>}
              {citaSel.estado !== 'no-asistio' && <button onClick={() => { onActualizar(citaSel.id,'no-asistio'); setCitaSel(null) }} className="border border-marfil/10 text-marfil/30 hover:bg-marfil/5 py-2 text-xs transition-all">No asistió</button>}
              <a href={`https://wa.me/${citaSel.cliente_telefono.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                className="border border-dorado/20 text-dorado/60 hover:bg-dorado/10 py-2 text-xs transition-all text-center">WhatsApp</a>
            </div>
          </div>
        </div>
      )}

      {/* Modal nueva cita */}
      {modalNueva && (
        <div className="fixed inset-0 z-50 bg-negro/90 flex items-center justify-center p-6" style={{backdropFilter:'blur(8px)'}}>
          <div className="bg-negro2 border border-marfil/10 max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-cormorant text-2xl italic">Nueva Cita</h2>
              <button onClick={() => setModalNueva(false)} className="text-marfil/30 hover:text-marfil text-xl">✕</button>
            </div>

            {/* Fecha y hora */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Fecha *</label>
                <input type="date" value={fechaNueva} onChange={e => { setFechaNueva(e.target.value); cargarHoras(e.target.value); setHoraNueva('') }} className="input-dark w-full" />
              </div>
              <div>
                <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Tipo de cita</label>
                <select value={formNueva.tipo_cita} onChange={e => setFormNueva(f=>({...f,tipo_cita:e.target.value}))} className="select-dark w-full">
                  <option value="primera-entrevista">Primera entrevista</option>
                  <option value="prueba">Prueba</option>
                  <option value="ajuste">Ajuste</option>
                  <option value="entrega">Entrega</option>
                </select>
              </div>
            </div>

            {horasDisp.length > 0 && (
              <div className="mb-5">
                <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Horario *</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {horasDisp.map(h => (
                    <button key={h} onClick={() => setHoraNueva(h)}
                      className={`py-2 text-xs border transition-all ${horaNueva===h ? 'border-dorado bg-dorado/10 text-dorado' : 'border-marfil/10 text-marfil/50 hover:border-dorado/30'}`}>{h}</button>
                  ))}
                </div>
              </div>
            )}
            {fechaNueva && horasDisp.length === 0 && <p className="text-marfil/30 text-xs mb-4 text-center">No hay horarios disponibles este día</p>}

            {/* Buscar clienta existente */}
            <div className="mb-4">
              <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-2">Clienta</label>
              <div className="flex gap-2 mb-2">
                <button onClick={() => setEsNuevoCliente(false)} className={`text-xs px-3 py-1.5 border transition-all flex-1 ${!esNuevoCliente ? 'border-dorado bg-dorado/10 text-dorado' : 'border-marfil/10 text-marfil/40'}`}>Clienta existente</button>
                <button onClick={() => setEsNuevoCliente(true)} className={`text-xs px-3 py-1.5 border transition-all flex-1 ${esNuevoCliente ? 'border-dorado bg-dorado/10 text-dorado' : 'border-marfil/10 text-marfil/40'}`}>Nueva clienta</button>
              </div>

              {!esNuevoCliente ? (
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-marfil/30" />
                  <input value={busquedaCliente} onChange={e => { setBusquedaCliente(e.target.value); setClienteSel(null) }}
                    placeholder="Buscar por nombre o email..." className="input-dark pl-9 text-xs py-2 w-full" />
                  {busquedaCliente && !clienteSel && clientesFiltrados.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-10 bg-negro2 border border-marfil/15 border-t-0">
                      {clientesFiltrados.map(c => (
                        <button key={c.id} onClick={() => seleccionarCliente(c)}
                          className="w-full text-left px-4 py-2.5 hover:bg-negro3 transition-colors border-b border-marfil/5 last:border-0">
                          <p className="text-sm">{c.nombre}</p>
                          <p className="text-marfil/40 text-xs">{c.email} · {c.telefono}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  {clienteSel && <p className="text-dorado text-xs mt-1.5 flex items-center gap-1">✓ {clienteSel.nombre}</p>}
                </div>
              ) : (
                <div className="space-y-3">
                  <div><label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Nombre *</label><input value={formNueva.cliente_nombre} onChange={e => setFormNueva(f=>({...f,cliente_nombre:e.target.value}))} className="input-dark w-full" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Email *</label><input value={formNueva.cliente_email} onChange={e => setFormNueva(f=>({...f,cliente_email:e.target.value}))} type="email" className="input-dark w-full" /></div>
                    <div><label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Teléfono</label><input value={formNueva.cliente_telefono} onChange={e => setFormNueva(f=>({...f,cliente_telefono:e.target.value}))} className="input-dark w-full" /></div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div><label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Tipo de evento</label>
                <select value={formNueva.tipo_evento} onChange={e => setFormNueva(f=>({...f,tipo_evento:e.target.value}))} className="select-dark w-full">
                  <option value="novia">Novia</option><option value="quinceanera">Quinceañera</option>
                  <option value="gala">Gala</option><option value="miss">Miss</option><option value="otro">Otro</option>
                </select></div>
              <div><label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Notas</label>
                <input value={formNueva.notas} onChange={e => setFormNueva(f=>({...f,notas:e.target.value}))} className="input-dark w-full" placeholder="Opcional..." /></div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setModalNueva(false)} className="btn-ghost flex-1 justify-center py-2.5 text-xs">Cancelar</button>
              <button onClick={confirmarCita} disabled={agendando || !fechaNueva || !horaNueva} className="btn-gold-fill flex-1 justify-center py-2.5 text-xs gap-2 disabled:opacity-40">
                {agendando ? <Loader2 size={12} className="animate-spin" /> : null}
                Confirmar cita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
