'use client'
import { useState, useRef } from 'react'
import { Plus, Trash2, Send, FileText, Check, X, Upload, Loader2, MessageCircle, Mail } from 'lucide-react'
import { formatPrecio } from '@/lib/utils'
import { toast } from 'sonner'
import type { Presupuesto, AnticipoItem, CuotaItem, Cliente } from '@/types'

interface Props {
  clienteId: string
  cliente: Cliente
  presupuestos: Presupuesto[]
  token: string
  onActualizar: () => void
}

const ESTADO_COLORS: Record<string, string> = {
  pendiente: 'text-yellow-400/70 bg-yellow-400/10 border-yellow-400/25',
  aprobado: 'text-green-400/70 bg-green-400/10 border-green-400/25',
  rechazado: 'text-red-400/60 bg-red-400/10 border-red-400/20',
}

export default function SeccionPresupuesto({ clienteId, cliente, presupuestos, token, onActualizar }: Props) {
  const [mostrando, setMostrando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [subiendoImg, setSubiendoImg] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    descripcion_diseno: '',
    precio_total: '',
    notas: '',
    imagen_referencia: '',
    anticipos: [] as AnticipoItem[],
    cuotas: [] as CuotaItem[],
  })

  function authH() { return { 'Content-Type': 'application/json', 'x-admin-token': token } }

  async function subirImagen(file: File) {
    setSubiendoImg(true)
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      const res = await fetch('/api/admin/upload', {
        method: 'POST', headers: authH(),
        body: JSON.stringify({ base64: reader.result, nombre: file.name }),
      })
      const json = await res.json()
      if (res.ok) { setForm(f => ({ ...f, imagen_referencia: json.url })); toast.success('Imagen subida') }
      setSubiendoImg(false)
    }
  }

  function agregarAnticipo() {
    setForm(f => ({
      ...f, anticipos: [...f.anticipos, { fecha: new Date().toISOString().split('T')[0], monto: 0, descripcion: '', pagado: false }]
    }))
  }

  function agregarCuota() {
    const num = form.cuotas.length + 1
    setForm(f => ({
      ...f, cuotas: [...f.cuotas, { numero: num, fecha_vencimiento: '', monto: 0, pagado: false }]
    }))
  }

  async function guardarPresupuesto() {
    if (!form.precio_total) { toast.error('Precio total requerido'); return }
    setGuardando(true)
    try {
      const res = await fetch('/api/admin/presupuestos', {
        method: 'POST', headers: authH(),
        body: JSON.stringify({ cliente_id: clienteId, ...form, precio_total: parseFloat(form.precio_total) }),
      })
      if (!res.ok) throw new Error('Error al guardar')
      setMostrando(false)
      setForm({ descripcion_diseno: '', precio_total: '', notas: '', imagen_referencia: '', anticipos: [], cuotas: [] })
      onActualizar(); toast.success('Presupuesto creado')
    } catch (e: any) { toast.error(e.message) }
    finally { setGuardando(false) }
  }

  async function cambiarEstado(id: string, estado: string) {
    const res = await fetch('/api/admin/presupuestos', {
      method: 'PATCH', headers: authH(),
      body: JSON.stringify({ id, cliente_id: clienteId, estado }),
    })
    if (res.ok) { onActualizar(); toast.success(`Presupuesto ${estado}`) }
  }

  async function marcarPago(presId: string, tipo: 'anticipo' | 'cuota', idx: number, pagado: boolean) {
    const pres = presupuestos.find(p => p.id === presId)!
    const updates: any = {}
    if (tipo === 'anticipo') {
      const ants = [...pres.anticipos]
      ants[idx] = { ...ants[idx], pagado }
      updates.anticipos = ants
    } else {
      const cuots = [...pres.cuotas]
      cuots[idx] = { ...cuots[idx], pagado }
      updates.cuotas = cuots
    }
    await fetch('/api/admin/presupuestos', {
      method: 'PATCH', headers: authH(),
      body: JSON.stringify({ id: presId, cliente_id: clienteId, ...updates }),
    })
    onActualizar()
  }

  async function eliminarPresupuesto(id: string) {
    if (!confirm('¿Eliminar este presupuesto?')) return
    await fetch('/api/admin/presupuestos', { method: 'DELETE', headers: authH(), body: JSON.stringify({ id }) })
    onActualizar(); toast.success('Presupuesto eliminado')
  }

  function enviarPorWA(p: Presupuesto) {
    const cuotasTexto = p.cuotas.length > 0 ? `\n🗓 Cuotas: ${p.cuotas.length} x ${formatPrecio(p.cuotas[0]?.monto || 0)}` : ''
    const anticipoTexto = p.anticipos.length > 0 ? `\n💵 Anticipo: ${formatPrecio(p.anticipos[0]?.monto || 0)}` : ''
    const msg = `🌹 *Presupuesto ${p.numero} — Atelier Aurelio Martínez*\n\nHola ${cliente?.nombre?.split(' ')[0]}! Te enviamos el presupuesto de tu vestido.\n\n✨ Descripción: ${p.descripcion_diseno || 'Diseño personalizado'}\n💎 Total: ${formatPrecio(p.precio_total)}${anticipoTexto}${cuotasTexto}\n\n¿Tenés alguna consulta? Estamos a tu disposición.`
    window.open(`https://wa.me/${cliente?.telefono?.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  function imprimirPresupuesto(p: Presupuesto) {
    const w = window.open('', '_blank')!
    w.document.write(`
      <html><head><title>Presupuesto ${p.numero}</title>
      <style>
        body{font-family:'Georgia',serif;max-width:700px;margin:40px auto;color:#1a1a1a;padding:20px}
        .header{text-align:center;border-bottom:1px solid #C9A96E;padding-bottom:20px;margin-bottom:30px}
        .logo{font-size:24px;letter-spacing:6px;text-transform:uppercase;color:#1a1a1a}
        .sub{font-size:11px;letter-spacing:3px;color:#888;margin-top:4px}
        .num{font-size:13px;color:#C9A96E;letter-spacing:2px;margin-top:12px}
        h2{font-size:16px;letter-spacing:2px;text-transform:uppercase;color:#C9A96E;margin:25px 0 12px;font-weight:normal}
        .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px}
        .total{font-size:18px;font-weight:bold;color:#C9A96E;border-top:2px solid #C9A96E;padding-top:12px;margin-top:8px}
        .desc{background:#f9f7f3;padding:16px;font-size:14px;line-height:1.7;font-style:italic}
        .estado{display:inline-block;padding:4px 12px;border:1px solid #C9A96E;color:#C9A96E;font-size:12px;letter-spacing:2px;text-transform:uppercase}
        .footer{text-align:center;margin-top:50px;font-size:11px;color:#aaa;letter-spacing:1px}
        table{width:100%;border-collapse:collapse;font-size:13px}
        th{text-align:left;padding:8px;background:#f9f7f3;color:#666;font-weight:normal;letter-spacing:1px;font-size:11px;text-transform:uppercase}
        td{padding:8px;border-bottom:1px solid #f0f0f0}
      </style></head><body>
      <div class="header">
        <div class="logo">Aurelio Martínez</div>
        <div class="sub">Atelier de Alta Costura · Buenos Aires</div>
        <div class="num">${p.numero} · ${new Date(p.created_at).toLocaleDateString('es-AR',{day:'numeric',month:'long',year:'numeric'})}</div>
      </div>
      <div class="row"><span>Cliente</span><span>${cliente?.nombre}</span></div>
      <div class="row"><span>Teléfono</span><span>${cliente?.telefono || ''}</span></div>
      <div class="row"><span>Email</span><span>${cliente?.email || ''}</span></div>
      <div class="row"><span>Estado</span><span class="estado">${p.estado}</span></div>
      <h2>Descripción del diseño</h2>
      <div class="desc">${p.descripcion_diseno || 'Diseño personalizado Aurelio Martínez'}</div>
      ${p.anticipos.length > 0 ? `<h2>Anticipos</h2><table><tr><th>Descripción</th><th>Fecha</th><th>Monto</th><th>Estado</th></tr>${p.anticipos.map(a => `<tr><td>${a.descripcion||'Anticipo'}</td><td>${a.fecha}</td><td>${formatPrecio(a.monto)}</td><td>${a.pagado?'✓ Pagado':'Pendiente'}</td></tr>`).join('')}</table>` : ''}
      ${p.cuotas.length > 0 ? `<h2>Cuotas</h2><table><tr><th>Cuota</th><th>Vencimiento</th><th>Monto</th><th>Estado</th></tr>${p.cuotas.map(c => `<tr><td>Cuota ${c.numero}</td><td>${c.fecha_vencimiento}</td><td>${formatPrecio(c.monto)}</td><td>${c.pagado?'✓ Pagado':'Pendiente'}</td></tr>`).join('')}</table>` : ''}
      <div class="row total"><span>TOTAL</span><span>${formatPrecio(p.precio_total)}</span></div>
      ${p.notas ? `<h2>Notas</h2><div class="desc">${p.notas}</div>` : ''}
      <div class="footer">El Salvador 5930, Palermo Hollywood, CABA · +54 9 11 3620-5098 · @aureliomartinezmoda</div>
      </body></html>
    `)
    w.document.close()
    setTimeout(() => w.print(), 500)
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText size={18} className="text-dorado" strokeWidth={1.5} />
          <h2 className="font-cormorant text-xl italic">Presupuestos</h2>
        </div>
        <button onClick={() => setMostrando(true)} className="btn-gold text-xs py-2 px-4 flex items-center gap-1.5">
          <Plus size={13} /> Nuevo presupuesto
        </button>
      </div>

      {/* Formulario nuevo presupuesto */}
      {mostrando && (
        <div className="card-dark mb-6 border border-dorado/20">
          <p className="text-xs text-dorado tracking-widest uppercase mb-5">Nuevo presupuesto</p>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-marfil/30 uppercase tracking-wider block mb-1.5">Descripción del diseño</label>
              <textarea value={form.descripcion_diseno} onChange={e => setForm(f => ({...f, descripcion_diseno: e.target.value}))}
                rows={3} className="input-dark resize-none text-sm w-full" placeholder="Describí el vestido en detalle: materiales, bordados, silueta, detalles..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-marfil/30 uppercase tracking-wider block mb-1.5">Precio total (ARS) *</label>
                <input type="number" value={form.precio_total} onChange={e => setForm(f => ({...f, precio_total: e.target.value}))}
                  className="input-dark text-sm" placeholder="0" />
              </div>
              <div>
                <label className="text-xs text-marfil/30 uppercase tracking-wider block mb-1.5">Imagen de referencia</label>
                {form.imagen_referencia
                  ? <div className="relative w-20 h-20">
                      <img src={form.imagen_referencia} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setForm(f => ({...f, imagen_referencia: ''}))} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white flex items-center justify-center text-xs">✕</button>
                    </div>
                  : <button onClick={() => fileRef.current?.click()} disabled={subiendoImg}
                      className="w-full border border-dashed border-marfil/15 py-3 text-xs text-marfil/30 hover:border-dorado/30 hover:text-dorado transition-all flex items-center justify-center gap-2">
                      {subiendoImg ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                      Subir imagen
                    </button>
                }
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { if (e.target.files?.[0]) subirImagen(e.target.files[0]); e.target.value = '' }} />
              </div>
            </div>

            {/* Anticipos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-marfil/30 uppercase tracking-wider">Anticipos</label>
                <button onClick={agregarAnticipo} className="text-xs text-dorado hover:text-dorado/70 flex items-center gap-1"><Plus size={11} /> Agregar</button>
              </div>
              {form.anticipos.map((a, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                  <input type="date" value={a.fecha} onChange={e => { const ants=[...form.anticipos]; ants[i]={...ants[i],fecha:e.target.value}; setForm(f=>({...f,anticipos:ants})) }} className="input-dark text-xs" />
                  <input type="number" placeholder="Monto" value={a.monto||''} onChange={e => { const ants=[...form.anticipos]; ants[i]={...ants[i],monto:parseFloat(e.target.value)||0}; setForm(f=>({...f,anticipos:ants})) }} className="input-dark text-xs" />
                  <input placeholder="Descripción" value={a.descripcion||''} onChange={e => { const ants=[...form.anticipos]; ants[i]={...ants[i],descripcion:e.target.value}; setForm(f=>({...f,anticipos:ants})) }} className="input-dark text-xs" />
                  <button onClick={() => setForm(f => ({...f, anticipos: f.anticipos.filter((_,j)=>j!==i)}))} className="text-red-400/40 hover:text-red-400/70"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>

            {/* Cuotas */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-marfil/30 uppercase tracking-wider">Cuotas</label>
                <button onClick={agregarCuota} className="text-xs text-dorado hover:text-dorado/70 flex items-center gap-1"><Plus size={11} /> Agregar</button>
              </div>
              {form.cuotas.map((c, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                  <input type="date" placeholder="Vencimiento" value={c.fecha_vencimiento} onChange={e => { const cs=[...form.cuotas]; cs[i]={...cs[i],fecha_vencimiento:e.target.value}; setForm(f=>({...f,cuotas:cs})) }} className="input-dark text-xs" />
                  <input type="number" placeholder="Monto" value={c.monto||''} onChange={e => { const cs=[...form.cuotas]; cs[i]={...cs[i],monto:parseFloat(e.target.value)||0}; setForm(f=>({...f,cuotas:cs})) }} className="input-dark text-xs" />
                  <button onClick={() => setForm(f => ({...f, cuotas: f.cuotas.filter((_,j)=>j!==i)}))} className="text-red-400/40 hover:text-red-400/70"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs text-marfil/30 uppercase tracking-wider block mb-1.5">Notas internas</label>
              <textarea value={form.notas} onChange={e => setForm(f => ({...f, notas: e.target.value}))}
                rows={2} className="input-dark resize-none text-sm w-full" placeholder="Notas privadas sobre el presupuesto..." />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={guardarPresupuesto} disabled={guardando} className="btn-gold-fill flex-1 justify-center py-2.5 text-xs flex items-center gap-2">
              {guardando ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />} Crear presupuesto
            </button>
            <button onClick={() => setMostrando(false)} className="btn-ghost flex-1 justify-center py-2.5 text-xs">Cancelar</button>
          </div>
        </div>
      )}

      {/* Lista presupuestos */}
      <div className="space-y-4">
        {presupuestos.map(p => {
          const totalPagado = [...p.anticipos.filter(a=>a.pagado).map(a=>a.monto), ...p.cuotas.filter(c=>c.pagado).map(c=>c.monto)].reduce((a,b)=>a+b,0)
          const saldo = p.precio_total - totalPagado
          return (
            <div key={p.id} className="card-dark">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-dorado text-xs tracking-wider">{p.numero}</span>
                    <span className={`text-xs px-2 py-0.5 border ${ESTADO_COLORS[p.estado]}`}>{p.estado}</span>
                  </div>
                  <p className="font-cormorant text-2xl">{formatPrecio(p.precio_total)}</p>
                  <div className="flex gap-4 mt-1">
                    <span className="text-xs text-green-400/60">Cobrado: {formatPrecio(totalPagado)}</span>
                    <span className={`text-xs ${saldo > 0 ? 'text-red-400/60' : 'text-green-400/60'}`}>Saldo: {formatPrecio(saldo)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => enviarPorWA(p)} className="border border-dorado/20 text-dorado/50 hover:bg-dorado/10 px-2 py-1.5 text-xs transition-all flex items-center gap-1">
                    <MessageCircle size={11} /> WA
                  </button>
                  <button onClick={() => imprimirPresupuesto(p)} className="border border-marfil/10 text-marfil/30 hover:border-dorado/30 hover:text-dorado px-2 py-1.5 text-xs transition-all">
                    PDF
                  </button>
                  {p.estado === 'pendiente' && <>
                    <button onClick={() => cambiarEstado(p.id, 'aprobado')} className="border border-green-400/20 text-green-400/50 hover:bg-green-400/10 px-2 py-1.5 text-xs transition-all">Aprobar</button>
                    <button onClick={() => cambiarEstado(p.id, 'rechazado')} className="border border-red-400/15 text-red-400/40 hover:bg-red-400/10 px-2 py-1.5 text-xs transition-all">Rechazar</button>
                  </>}
                  <button onClick={() => eliminarPresupuesto(p.id)} className="text-red-400/30 hover:text-red-400/60 transition-colors px-1">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {p.descripcion_diseno && <p className="text-marfil/40 text-sm italic mb-4 leading-relaxed">"{p.descripcion_diseno}"</p>}
              {p.imagen_referencia && <img src={p.imagen_referencia} alt="Referencia" className="h-32 object-cover mb-4 border border-marfil/10" />}

              {/* Anticipos */}
              {p.anticipos.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-marfil/25 uppercase tracking-wider mb-2">Anticipos</p>
                  {p.anticipos.map((a, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-marfil/5">
                      <div className="flex items-center gap-3">
                        <button onClick={() => marcarPago(p.id, 'anticipo', i, !a.pagado)}
                          className={`w-5 h-5 border flex items-center justify-center transition-all ${a.pagado ? 'border-green-400/40 bg-green-400/15 text-green-400' : 'border-marfil/15 text-transparent hover:border-dorado/30'}`}>
                          <Check size={11} />
                        </button>
                        <span className="text-xs text-marfil/50">{a.descripcion || 'Anticipo'} · {a.fecha}</span>
                      </div>
                      <span className={`text-sm ${a.pagado ? 'text-green-400/70' : 'text-marfil/60'}`}>{formatPrecio(a.monto)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Cuotas */}
              {p.cuotas.length > 0 && (
                <div>
                  <p className="text-xs text-marfil/25 uppercase tracking-wider mb-2">Cuotas</p>
                  {p.cuotas.map((c, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-marfil/5">
                      <div className="flex items-center gap-3">
                        <button onClick={() => marcarPago(p.id, 'cuota', i, !c.pagado)}
                          className={`w-5 h-5 border flex items-center justify-center transition-all ${c.pagado ? 'border-green-400/40 bg-green-400/15 text-green-400' : 'border-marfil/15 text-transparent hover:border-dorado/30'}`}>
                          <Check size={11} />
                        </button>
                        <span className="text-xs text-marfil/50">Cuota {c.numero} · vence {c.fecha_vencimiento}</span>
                      </div>
                      <span className={`text-sm ${c.pagado ? 'text-green-400/70' : 'text-marfil/60'}`}>{formatPrecio(c.monto)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        {presupuestos.length === 0 && !mostrando && (
          <div className="text-center py-12 text-marfil/20">
            <FileText size={36} className="mx-auto mb-3" strokeWidth={0.5} />
            <p className="font-cormorant text-xl italic">Sin presupuestos</p>
            <p className="text-xs mt-1">Creá el primer presupuesto para esta clienta</p>
          </div>
        )}
      </div>
    </div>
  )
}
