'use client'
import { useState, useEffect } from 'react'
import AdminLogin from '@/components/admin/AdminLogin'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token')
    if (token) setAutenticado(true)
    setCargando(false)
  }, [])

  function handleLogin(token: string) {
    sessionStorage.setItem('admin_token', token)
    setAutenticado(true)
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_token')
    setAutenticado(false)
  }

  if (cargando) return (
    <div className="min-h-screen bg-negro flex items-center justify-center">
      <div className="w-6 h-6 border border-dorado/30 border-t-dorado rounded-full animate-spin" />
    </div>
  )

  return autenticado
    ? <AdminDashboard onLogout={handleLogout} />
    : <AdminLogin onLogin={handleLogin} />
}
