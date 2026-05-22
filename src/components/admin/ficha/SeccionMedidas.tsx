'use client'
import { useState } from 'react'
import { Plus, Save, Trash2, Ruler } from 'lucide-react'
import { toast } from 'sonner'
import type { Medida } from '@/types'

const CAMPOS_MEDIDAS = [
  { key: 'busto', label: 'Busto', unidad: 'cm' },
  { key: 'bajo_busto', label: 'Bajo busto', unidad: 'cm' },
  { key: 'cintura', label: 'Cintura', unidad: 'cm' },
  { key: 'cadera', label: 'Cadera', unidad: 'cm' },
  { key: 'largo_delantero', label: 'Largo delantero', unidad: 'cm' },
  { key: 'largo_espalda', label: 'Largo espalda', unidad: 'cm' },
  { key: 'largo_total', label: 'Largo total', unidad: 'cm' },
  { key: 'hombros', label: 'Hombros', unidad: 'cm' },
  { key: 'sisa', label: 'Sisa', unidad: 'cm' },
  { key: 'brazo', label: 'Brazo', unidad: 'cm' },
  { key: 'biceps', label: 'Bíceps', unidad: 'cm' },
  { key: 'muneca', label: 'Muñeca', unidad: 'cm' },
  { key: 'tiro', label: 'Tiro', unidad: 'cm' },
  { key: 'largo_falda', label: 'Largo falda', unidad: 'cm' },
  { key: 'altura', label: 'Altura', unidad: 'cm' },
  { key: 'talle', label: 'Talle', unidad: 'cm' },
  { key: 'taco_zapato', label: 'Taco del zapato', unidad: 'cm' },
]

interface Props {
  clienteId: string
  medidas: Medida[]
  token: string
  onActualizar: () => void
}

export default function SeccionMedidas({ clienteId, medidas, token, onActualizar }: Props) {
  const [nuevasMedidas, setNuevasMedidas] = useState<Record<string, string>>({})
  const [observaciones, setObservaciones] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Record<string, string>>({})

  function authH() { return { 'Content-Type': 'application/json', 'x-admin-token': token } }

  async function guardarMedidas() {
    setGuardando(true)
    try {
      const payload: any = { cliente_id: clienteId, observaciones }
      CAMPOS_MEDIDAS.forEach(c => {
        if (nuevasMedidas[c.key]) payload[c.key] = parseFloat(nuevasMedidas[c.key])
      })
      const res = await fetch('/api/admin/medidas', {
        method: 'POST', headers: authH(), body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Error al guardar')
      setNuevasMedidas({}); setObservaciones('')
      onActualizar(); toast.success('Medidas guardadas')
    } catch (e: any) { toast.error(e.message) }
    finally { setGuardando(false) }
  }

  async function actualizarMedida() {
    if (!editandoId) return
    const payload: any = {}
    CAMPOS_MEDIDAS.forEach(c => { if (editForm[c.key] !== undefined) payload[c.key] = editForm[c.key] ? parseFloat(editForm[c.key]) : null })
    payload.observaciones = editForm.observaciones
    const res = await fetch('/api/admin/medidas', {
      method: 'PATCH', headers: authH(), body: JSON.stringify({ id: editandoId, ...payload }),
    })
    if (res.ok) { setEditandoId(null); onActualizar(); toast.success('Medidas actualizadas') }
  }

  async function eliminarMedida(id: string) {
    if (!confirm('¿Eliminar este registro de medidas?')) return
    await fetch('/api/admin/medidas', { method: 'DELETE', headers: authH(), body: JSON.stringify({ id }) })
    onActualizar(); toast.success('Registro eliminado')
  }

  const ultimasMedidas = medidas[0]

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Ruler size={18} className="text-dorado" strokeWidth={1.5} />
        <h2 className="font-cormorant text-xl italic">Medidas de la clienta</h2>
      </div>

      {/* Formulario nuevo registro */}
      <div className="card-dark mb-6 border border-dorado/15">
        <p className="text-xs text-dorado tracking-widest uppercase mb-5">Nuevo registro de medidas</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {CAMPOS_MEDIDAS.map(c => (
            <div key={c.key}>
              <label className="text-xs text-marfil/30 uppercase tracking-wider block mb-1">{c.label}</label>
              <div className="flex items-center">
                <input
                  type="number"
                  step="0.1"
                  value={nuevasMedidas[c.key] || ''}
                  onChange={e => setNuevasMedidas(m => ({ ...m, [c.key]: e.target.value }))}
                  placeholder={ultimasMedidas ? String((ultimasMedidas as any)[c.key] || '') : '0'}
                  className="input-dark text-sm flex-1 min-w-0"
                />
                <span className="text-marfil/20 text-xs ml-1 flex-shrink-0">{c.unidad}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mb-4">
          <label className="text-xs text-marfil/30 uppercase tracking-wider block mb-1.5">Observaciones</label>
          <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} rows={2}
            className="input-dark resize-none text-sm w-full" placeholder="Notas sobre las medidas..." />
        </div>
        <button onClick={guardarMedidas} disabled={guardando} className="btn-gold-fill text-xs py-2.5 px-6 flex items-center gap-2">
          <Save size={13} /> {guardando ? 'Guardando...' : 'Guardar medidas'}
        </button>
      </div>

      {/* Historial de medidas */}
      {medidas.length > 0 && (
        <div>
          <p className="text-xs text-marfil/30 tracking-widest uppercase mb-4">Historial de registros ({medidas.length})</p>
          <div className="space-y-px">
            {medidas.map((m, idx) => (
              <div key={m.id} className={`card-dark ${idx === 0 ? 'border-dorado/20' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium">{new Date(m.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    {idx === 0 && <span className="text-xs px-2 py-0.5 bg-dorado/10 text-dorado border border-dorado/20">Último registro</span>}
                  </div>
                  <div className="flex gap-2">
                    {editandoId === m.id
                      ? <>
                          <button onClick={actualizarMedida} className="text-xs px-3 py-1.5 border border-dorado/30 text-dorado hover:bg-dorado/10 transition-all">Guardar</button>
                          <button onClick={() => setEditandoId(null)} className="text-xs px-3 py-1.5 border border-marfil/10 text-marfil/40 hover:text-marfil/70 transition-all">Cancelar</button>
                        </>
                      : <button onClick={() => { setEditandoId(m.id); const f: any = {}; CAMPOS_MEDIDAS.forEach(c => { f[c.key] = (m as any)[c.key] ?? '' }); f.observaciones = m.observaciones || ''; setEditForm(f) }}
                          className="text-xs px-3 py-1.5 border border-marfil/10 text-marfil/40 hover:border-dorado/30 hover:text-dorado transition-all">Editar</button>
                    }
                    <button onClick={() => eliminarMedida(m.id)} className="text-red-400/40 hover:text-red-400/70 transition-colors">
                      <Trash2 size={13} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {CAMPOS_MEDIDAS.filter(c => (m as any)[c.key]).map(c => (
                    <div key={c.key} className="bg-negro3 px-2 py-1.5">
                      <p className="text-marfil/25 text-xs">{c.label}</p>
                      {editandoId === m.id
                        ? <input type="number" step="0.1" value={editForm[c.key] || ''} onChange={e => setEditForm(f => ({ ...f, [c.key]: e.target.value }))} className="text-sm text-dorado bg-transparent w-full focus:outline-none" />
                        : <p className="text-sm text-marfil/80 font-medium">{(m as any)[c.key]} <span className="text-marfil/20 text-xs">cm</span></p>
                      }
                    </div>
                  ))}
                </div>
                {m.observaciones && <p className="text-marfil/40 text-xs mt-3 italic border-t border-marfil/5 pt-2">"{m.observaciones}"</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {medidas.length === 0 && (
        <div className="text-center py-12 text-marfil/20">
          <Ruler size={36} className="mx-auto mb-3" strokeWidth={0.5} />
          <p className="font-cormorant text-xl italic">Sin medidas registradas</p>
          <p className="text-xs mt-1">Completá el formulario arriba para guardar las medidas</p>
        </div>
      )}
    </div>
  )
}
