import { Clock, ArrowRight } from 'lucide-react'

interface Evento {
  id: string
  evento: string
  descripcion?: string
  estado_anterior?: string
  estado_nuevo?: string
  created_at: string
}

export default function TimelineProyecto({ historial }: { historial: Evento[] }) {
  if (historial.length === 0) return (
    <div className="text-center py-12 text-marfil/20">
      <Clock size={36} className="mx-auto mb-3" strokeWidth={0.5} />
      <p className="font-cormorant text-xl italic">Sin historial todavía</p>
      <p className="text-xs mt-1">Los eventos del proyecto aparecerán aquí</p>
    </div>
  )

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Clock size={18} className="text-dorado" strokeWidth={1.5} />
        <h2 className="font-cormorant text-xl italic">Timeline del proyecto</h2>
      </div>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-dorado/15" />
        <div className="space-y-4">
          {historial.map((e, i) => (
            <div key={e.id} className="flex gap-4 relative">
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 z-10 ${i === 0 ? 'border-dorado bg-dorado/15' : 'border-marfil/15 bg-negro2'}`}>
                <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-dorado' : 'bg-marfil/20'}`} />
              </div>
              <div className="flex-1 pb-4">
                <div className="card-dark">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium">{e.evento}</p>
                    <span className="text-marfil/25 text-xs flex-shrink-0 ml-3">
                      {new Date(e.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {e.estado_anterior && e.estado_nuevo && (
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className="text-marfil/30 capitalize">{e.estado_anterior?.replace(/-/g, ' ')}</span>
                      <ArrowRight size={10} className="text-dorado" />
                      <span className="text-dorado capitalize">{e.estado_nuevo?.replace(/-/g, ' ')}</span>
                    </div>
                  )}
                  {e.descripcion && <p className="text-marfil/40 text-xs mt-1">{e.descripcion}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
