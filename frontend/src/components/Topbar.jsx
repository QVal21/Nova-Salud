import { Link, useLocation } from 'react-router-dom'
import { Bell, Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { navItems } from '../config/nav'

export default function Topbar({ onMenu }) {
  const { user } = useAuth()
  const alertasActivas = useData().alertas.length
  const { pathname } = useLocation()
  const nombre = user?.nombre?.split(' ')[0] ?? ''
  const titulo = pathname === '/' ? `Hola, ${nombre}` : navItems.find((i) => i.path === pathname)?.label
  const fecha = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <header className="flex items-center gap-4 px-4 pt-6 pb-6 sm:px-6 lg:px-10 lg:pt-8">
      <button onClick={onMenu} className="rounded-xl p-2 hover:bg-surface lg:hidden" aria-label="Abrir menú">
        <Menu className="size-6" />
      </button>

      <div className="mr-auto min-w-0">
        <h1 className="truncate text-2xl font-extrabold tracking-tight sm:text-3xl">{titulo}</h1>
        <p className="mt-1 text-sm font-medium text-muted first-letter:uppercase">{fecha}</p>
      </div>

      <Link
        to="/alertas"
        className="relative shrink-0 rounded-2xl bg-surface p-3 ring-1 ring-line transition-colors hover:ring-brand"
        aria-label={`${alertasActivas} alertas activas`}
      >
        <Bell className="size-5" />
        {alertasActivas > 0 && (
          <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-sun text-[11px] font-bold text-sun-deep">
            {alertasActivas}
          </span>
        )}
      </Link>
    </header>
  )
}
