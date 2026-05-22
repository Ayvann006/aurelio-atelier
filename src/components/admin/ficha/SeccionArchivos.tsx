'use client'
import { useState, useRef } from 'react'
import { Upload, Trash2, Paperclip, Image, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const TIPOS = [
  { value: 'foto', label: 'Foto', icon: Image },
  { value: 'boceto', label: 'Boceto', icon: FileText },
  { value: 'prueba', label: 'Prueba', icon: Image },
  { value: 'referencia', label: 'Referencia', icon: Image },
  { value: 'otro', label: 'Otro', icon: Paperclip },
]

interface Archivo {
  id: string
  nombre: string
  url: string
  tipo: string
  created_at: string
}

interface Props {
  clienteId: string
  archivos: Archivo[]
  token: string
  onActualizar: () => void
}

export default function SeccionArchivos({ clienteId, archivos, token, onActualizar }: Props) {
  const [tipoSel, setTipoSel] = useState('foto')
  const [subiendo, setSubiendo] = useState(false)
  const [filtro, setFiltro] = useState('todos')
  const fileRef = useRef<HTMLInputElement>(null)

  function authH() { return { 'Content-Type': 'application/json', 'x-admin-token': token } }

  async function subirArchivo(file: File) {
    setSubiendo(true)
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      const res = await fetch('/api/admin/archivos', {
        method: 'POST', headers: authH(),
        body: JSON.stringify({ base64: reader.result, nombre: file.name, cliente_id: clienteId, tipo: tipoSel }),
      })
      if (res.ok) { onActualizar(); toast.success('Archivo subido') }
      else toast.error('Error al subir')
      setSubiendo(false)
    }
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar este archivo?')) return
    await fetch('/api/admin/archivos', { method: 'DELETE', headers: authH(), body: JSON.stringify({ id }) })
    onActualizar(); toast.success('Archivo eliminado')
  }

  const filtrados = filtro === 'todos' ? archivos : archivos.filter(a => a.tipo === filtro)

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Paperclip size={18} className="text-dorado" strokeWidth={1.5} />
          <h2 className="font-cormorant text-xl italic">Archivos adjuntos</h2>
        </div>
        <div className="flex gap-2 items-center">
          <select value={tipoSel} onChange={e => setTipoSel(e.target.value)} className="select-dark text-xs py-2">
            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <button onClick={() => fileRef.current?.click()} disabled={subiendo}
            className="btn-gold text-xs py-2 px-4 flex items-center gap-1.5">
            {subiendo ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            Subir
          </button>
          <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
            onChange={e => { if (e.target.files?.[0]) subirArchivo(e.target.files[0]); e.target.value = '' }} />
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[{value:'todos',label:'Todos'}, ...TIPOS].map(t => (
          <button key={t.value} onClick={() => setFiltro(t.value)}
            className={`text-xs px-3 py-1.5 border transition-all ${filtro === t.value ? 'border-dorado bg-dorado/10 text-dorado' : 'border-marfil/10 text-marfil/40 hover:border-dorado/30 hover:text-dorado'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center py-12 text-marfil/20">
          <Paperclip size={36} className="mx-auto mb-3" strokeWidth={0.5} />
          <p className="font-cormorant text-xl italic">Sin archivos</p>
          <p className="text-xs mt-1">Subí fotos, bocetos o referencias</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {filtrados.map(a => (
            <div key={a.id} className="group relative">
              <div className="aspect-square bg-negro3 overflow-hidden border border-marfil/8">
                {a.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                  ? <img src={a.url} alt={a.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  : <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <FileText size={24} className="text-marfil/20" strokeWidth={0.5} />
                      <span className="text-xs text-marfil/30 text-center px-2 truncate w-full">{a.nombre}</span>
                    </div>
                }
              </div>
              <div className="absolute inset-0 bg-negro/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <a href={a.url} target="_blank" rel="noopener noreferrer"
                  className="bg-negro/80 text-marfil text-xs px-3 py-1.5 hover:text-dorado transition-colors">Ver</a>
                <button onClick={() => eliminar(a.id)} className="bg-red-500/70 text-white text-xs px-2 py-1.5 hover:bg-red-500 transition-colors">
                  <Trash2 size={11} />
                </button>
              </div>
              <div className="mt-1.5">
                <p className="text-xs text-marfil/40 truncate">{a.nombre}</p>
                <p className="text-xs text-marfil/20">{a.tipo} · {new Date(a.created_at).toLocaleDateString('es-AR')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
