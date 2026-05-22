'use client'
import { useState } from 'react'
import { Lock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error('Contraseña incorrecta')
      onLogin(password)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-negro flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-12 h-12 border border-dorado/30 flex items-center justify-center mx-auto mb-6">
            <Lock size={18} className="text-dorado" strokeWidth={1} />
          </div>
          <p className="font-cormorant text-2xl italic mb-1">Panel de Administración</p>
          <p className="text-marfil/30 text-xs tracking-wider">Aurelio Martínez Atelier</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="input-dark text-center tracking-widest"
            autoFocus
          />
          <button type="submit" disabled={cargando} className="btn-gold-fill w-full justify-center py-3.5 gap-2">
            {cargando ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
            Ingresar
          </button>
        </form>
      </div>
    </div>
  )
}
