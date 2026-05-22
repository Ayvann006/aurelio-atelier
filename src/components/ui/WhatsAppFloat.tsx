'use client'
import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

export default function WhatsAppFloat() {
  const [abierto, setAbierto] = useState(false)
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || '5491136205098'

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {abierto && (
        <div className="bg-negro2 border border-dorado/20 shadow-2xl w-72 p-5 animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                <MessageCircle size={14} className="text-green-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium">Aurelio Martínez</p>
                <p className="text-marfil/40 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                  En línea
                </p>
              </div>
            </div>
            <button onClick={() => setAbierto(false)} className="text-marfil/30 hover:text-marfil transition-colors">
              <X size={14} />
            </button>
          </div>
          <div className="bg-negro3 p-3 mb-4 text-sm text-marfil/70 leading-relaxed">
            ¡Hola! 👋 ¿Querés saber más sobre nuestros diseños o agendar una cita?
          </div>
          <div className="flex flex-col gap-2">
            <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Hola! Me gustaría saber más sobre sus diseños.')}`}
              target="_blank" rel="noopener noreferrer"
              className="btn-gold-fill text-xs py-2.5 justify-center flex">
              Consultar por WhatsApp
            </a>
            <a href="/citas" className="btn-ghost text-xs py-2.5 justify-center flex">
              Agendar una cita
            </a>
          </div>
        </div>
      )}
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-14 h-14 bg-green-500 hover:bg-green-400 transition-colors flex items-center justify-center shadow-lg"
        aria-label="WhatsApp"
      >
        {abierto
          ? <X size={22} className="text-white" />
          : <MessageCircle size={24} className="text-white" strokeWidth={1.5} />
        }
      </button>
    </div>
  )
}
