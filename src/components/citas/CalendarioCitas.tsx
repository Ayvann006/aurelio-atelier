'use client'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Clock, Loader2 } from 'lucide-react'
import { formatHora } from '@/lib/utils'

interface Props {
  onSeleccionar: (fecha: string, hora: string) => void
}

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export default function CalendarioCitas({ onSeleccionar }: Props) {
  const hoy = new Date()
  const [mes, setMes] = useState(hoy.getMonth())
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [fechaSel, setFechaSel] = useState<string | null>(null)
  const [horaSel, setHoraSel] = useState<string | null>(null)
  const [horarios, setHorarios] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const primerDia = new Date(anio, mes, 1).getDay()
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()

  function dateStr(dia: number) {
    return `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
  }

  function esDisponible(dia: number) {
    const d = new Date(anio, mes, dia)
    const dow = d.getDay()
    if (dow === 0) return false // domingo
    if (d < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())) return false
    return true
  }

  useEffect(() => {
    if (!fechaSel) return
    setLoading(true)
    setHoraSel(null)
    fetch(`/api/disponibilidad?fecha=${fechaSel}`)
      .then((r) => r.json())
      .then((d) => setHorarios(d.disponibles || []))
      .finally(() => setLoading(false))
  }, [fechaSel])

  function prevMes() {
    if (mes === 0) { setMes(11); setAnio(a => a - 1) } else setMes(m => m - 1)
    setFechaSel(null); setHoraSel(null)
  }
  function nextMes() {
    if (mes === 11) { setMes(0); setAnio(a => a + 1) } else setMes(m => m + 1)
    setFechaSel(null); setHoraSel(null)
  }

  return (
    <div className="space-y-8">
      {/* Calendario */}
      <div className="card-dark">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMes} className="text-marfil/40 hover:text-dorado transition-colors p-1">
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <h2 className="font-cormorant text-xl tracking-wider">
            {MESES[mes]} {anio}
          </h2>
          <button onClick={nextMes} className="text-marfil/40 hover:text-dorado transition-colors p-1">
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DIAS.map((d) => (
            <div key={d} className="text-center text-xs text-marfil/30 tracking-wider py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: primerDia }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: diasEnMes }).map((_, i) => {
            const dia = i + 1
            const ds = dateStr(dia)
            const disp = esDisponible(dia)
            const sel = fechaSel === ds
            return (
              <button
                key={dia}
                disabled={!disp}
                onClick={() => { setFechaSel(ds); setHoraSel(null) }}
                className={`aspect-square flex items-center justify-center text-sm transition-all ${sel ? 'bg-dorado text-negro font-medium' : disp ? 'text-marfil hover:bg-dorado/15 hover:text-dorado' : 'text-marfil/15 cursor-not-allowed'}`}
              >
                {dia}
              </button>
            )
          })}
        </div>
      </div>

      {/* Horarios */}
      {fechaSel && (
        <div className="card-dark">
          <div className="flex items-center gap-2 mb-5">
            <Clock size={14} className="text-dorado" strokeWidth={1.5} />
            <span className="text-xs tracking-widest uppercase text-marfil/50">Horarios disponibles</span>
          </div>
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 size={20} className="text-dorado animate-spin" />
            </div>
          ) : horarios.length === 0 ? (
            <p className="text-center text-marfil/40 text-sm py-6">
              No hay turnos disponibles este día.<br />
              <span className="text-dorado text-xs">Por favor elegí otra fecha.</span>
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {horarios.map((h) => (
                <button
                  key={h}
                  onClick={() => setHoraSel(h)}
                  className={`py-2.5 text-sm border transition-all ${horaSel === h ? 'border-dorado bg-dorado/10 text-dorado' : 'border-marfil/10 text-marfil/60 hover:border-dorado/40 hover:text-dorado'}`}
                >
                  {formatHora(h)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      {fechaSel && horaSel && (
        <button
          onClick={() => onSeleccionar(fechaSel, horaSel)}
          className="btn-gold w-full justify-center py-4"
        >
          Continuar con {fechaSel} a las {formatHora(horaSel)}
        </button>
      )}
    </div>
  )
}
