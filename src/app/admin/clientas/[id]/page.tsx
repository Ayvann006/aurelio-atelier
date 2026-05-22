'use client'
import { useEffect, useState } from 'react'
import FichaClientaPage from '@/components/admin/ficha/FichaClientaPage'

export default function ClientaPage({ params }: { params: { id: string } }) {
  const [token, setToken] = useState('')

  useEffect(() => {
    setToken(sessionStorage.getItem('admin_token') || '')
  }, [])

  if (!token) return (
    <div className="min-h-screen bg-negro flex items-center justify-center">
      <p className="text-marfil/40 text-sm">Cargando...</p>
    </div>
  )

  return <FichaClientaPage clienteId={params.id} token={token} />
}
