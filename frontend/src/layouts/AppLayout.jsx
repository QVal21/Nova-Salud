import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { useData } from '../context/DataContext'

export default function AppLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { cargando, error, setError } = useData()

  return (
    <div className="min-h-screen bg-page text-ink lg:flex">
      <Sidebar open={menuAbierto} onClose={() => setMenuAbierto(false)} />
      <div className="min-w-0 flex-1">
        <Topbar onMenu={() => setMenuAbierto(true)} />
        <main className="px-4 pb-12 sm:px-6 lg:px-10">
          {error && (
            <div role="alert" className="mb-6 flex items-start justify-between gap-4 rounded-2xl bg-danger-tint px-5 py-4 text-sm font-semibold text-danger-deep">
              <span>{error}</span>
              <button onClick={() => setError('')} aria-label="Cerrar aviso" className="shrink-0">
                <X className="size-4" />
              </button>
            </div>
          )}
          {cargando ? <p className="py-24 text-center text-sm font-semibold text-muted">Cargando datos…</p> : <Outlet />}
        </main>
      </div>
    </div>
  )
}
