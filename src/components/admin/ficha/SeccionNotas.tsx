'use client'
import { useState } from 'react'
import { StickyNote, Star, Trash2, Edit2, Save, X } from 'lucide-react'
import { toast } from 'sonner'

interface Nota {
  id: string
  contenido: string
  autor: string
  importante: boolean
  created_at: string
  updated_at: string
}

interface Props {
  clienteId: string
  notas: Nota[]
  token: string
  onActualizar: () => void
}

export default function SeccionNotas({ clienteId, notas, token, onActualizar }: Props) {
  const [nuevo, setNuevo] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editTexto, setEditTexto] = useState('')

  function authH() { return { 'Content-Type': 'application/json', 'x-admin-token': token } }

  async function agregarNota() {
    if (!nuevo.trim()) return
    setGuardando(true)
    try {
      const res = await fetch('/api/admin/notas', {
        method: 'POST', headers: authH(),
        body: JSON.stringify({ cliente_id: clienteId, contenido: nuevo, autor: 'Aurelio', importante: false }),
      })
      if (!res.ok) throw new Error('Error')
      setNuevo(''); onActualizar(); toast.success('Nota guardada')
    } catch { toast.error('Error al guardar') }
    finally { setGuardando(false) }
  }

  async function toggleImportante(id: string, actual: boolean) {
    await fetch('/api/admin/notas', {
      method: 'PATCH', headers: authH(),
      body: JSON.stringify({ id, importante: !actual }),
    })
    onActualizar()
  }

  async function guardarEdicion(id: string) {
    await fetch('/api/admin/notas', {
      method: 'PATCH', headers: authH(),
      body: JSON.stringify({ id, contenido: editTexto }),
    })
    setEditandoId(null); onActualizar(); toast.success('Nota actualizada')
  }

  async function eliminarNota(id: string) {
    if (!confirm('¿Eliminar esta nota?')) return
    await fetch('/api/admin/notas', { method: 'DELETE', headers: authH(), body: JSON.stringify({ id }) })
    onActualizar(); toast.success('Nota eliminada')
  }

  const notasImportantes = notas.filter(n => n.importante)
  const notasNormales = notas.filter(n => !n.importante)

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <StickyNote size={18} className="text-dorado" strokeWidth={1.5} />
        <h2 className="font-cormorant text-xl italic">Notas privadas</h2>
      </div>

      {/* Nueva nota */}
      <div className="card-dark mb-6 border border-dorado/15">
        <textarea
          value={nuevo}
          onChange={e => setNuevo(e.target.value)}
          rows={3}
          placeholder="Escribí una observación, cambio solicitado, preferencia de la clienta, detalle técnico..."
          className="input-dark resize-none text-sm w-full mb-3"
        />
        <div className="flex justify-end">
          <button onClick={agregarNota} disabled={!nuevo.trim() || guardando}
            className="btn-gold-fill text-xs py-2 px-5 flex items-center gap-1.5 disabled:opacity-40">
            <Save size={12} /> Guardar nota
          </button>
        </div>
      </div>

      {/* Notas importantes */}
      {notasImportantes.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-dorado tracking-widest uppercase mb-3 flex items-center gap-1.5">
            <Star size={11} fill="currentColor" /> Destacadas
          </p>
          <div className="space-y-2">
            {notasImportantes.map(n => (
              <NotaCard key={n.id} nota={n} editandoId={editandoId} editTexto={editTexto}
                onEditar={() => { setEditandoId(n.id); setEditTexto(n.contenido) }}
                onGuardar={() => guardarEdicion(n.id)}
                onCancelar={() => setEditandoId(null)}
                onEditTexto={setEditTexto}
                onToggleImportante={() => toggleImportante(n.id, n.importante)}
                onEliminar={() => eliminarNota(n.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Notas normales */}
      {notasNormales.length > 0 && (
        <div>
          <p className="text-xs text-marfil/25 tracking-widest uppercase mb-3">Todas las notas</p>
          <div className="space-y-2">
            {notasNormales.map(n => (
              <NotaCard key={n.id} nota={n} editandoId={editandoId} editTexto={editTexto}
                onEditar={() => { setEditandoId(n.id); setEditTexto(n.contenido) }}
                onGuardar={() => guardarEdicion(n.id)}
                onCancelar={() => setEditandoId(null)}
                onEditTexto={setEditTexto}
                onToggleImportante={() => toggleImportante(n.id, n.importante)}
                onEliminar={() => eliminarNota(n.id)}
              />
            ))}
          </div>
        </div>
      )}

      {notas.length === 0 && (
        <div className="text-center py-12 text-marfil/20">
          <StickyNote size={36} className="mx-auto mb-3" strokeWidth={0.5} />
          <p className="font-cormorant text-xl italic">Sin notas todavía</p>
        </div>
      )}
    </div>
  )
}

function NotaCard({ nota, editandoId, editTexto, onEditar, onGuardar, onCancelar, onEditTexto, onToggleImportante, onEliminar }: any) {
  const editando = editandoId === nota.id
  return (
    <div className={`card-dark border ${nota.importante ? 'border-dorado/20 bg-dorado/3' : 'border-marfil/5'}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {editando
            ? <textarea value={editTexto} onChange={e => onEditTexto(e.target.value)} rows={3} className="input-dark resize-none text-sm w-full" />
            : <p className="text-sm text-marfil/70 leading-relaxed whitespace-pre-wrap">{nota.contenido}</p>
          }
          <div className="flex items-center gap-3 mt-2">
            <span className="text-marfil/25 text-xs">{nota.autor}</span>
            <span className="text-marfil/15 text-xs">·</span>
            <span className="text-marfil/25 text-xs">{new Date(nota.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {editando
            ? <>
                <button onClick={onGuardar} className="text-dorado hover:text-dorado/70 transition-colors p-1"><Save size={13} /></button>
                <button onClick={onCancelar} className="text-marfil/30 hover:text-marfil/60 transition-colors p-1"><X size={13} /></button>
              </>
            : <>
                <button onClick={onToggleImportante} className={`p-1 transition-colors ${nota.importante ? 'text-dorado' : 'text-marfil/20 hover:text-dorado/50'}`}>
                  <Star size={13} fill={nota.importante ? 'currentColor' : 'none'} />
                </button>
                <button onClick={onEditar} className="text-marfil/20 hover:text-dorado transition-colors p-1"><Edit2 size={12} /></button>
                <button onClick={onEliminar} className="text-marfil/20 hover:text-red-400/60 transition-colors p-1"><Trash2 size={12} /></button>
              </>
          }
        </div>
      </div>
    </div>
  )
}
