import { Link } from 'react-router-dom'
import { Bell, Menu, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { alertasActivas } from '../data/mock'

export default function Topbar({ onMenu }) {
  const { user } = useAuth()
  const nombre = user?.nombre?.split(' ')[0] ?? ''
  const fecha = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <header className="flex flex-wrap items-center gap-4 px-4 pt-6 pb-6 sm:px-6 lg:px-10 lg:pt-8">
      <button
        onClick={onMenu}
        className="rounded-xl p-2 hover:bg-surface lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="size-6" />
      </button>

      <div className="mr-auto">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Hola, {nombre}</h1>
        <p className="mt-1 text-sm font-medium text-muted first-letter:uppercase">{fecha}</p>
      </div>

      <label className="order-last flex w-full items-center gap-2 rounded-2xl bg-surface px-4 py-3 ring-1 ring-line focus-within:ring-2 focus-within:ring-brand sm:order-none sm:w-80">
        <Search className="size-4 text-muted" />
        <input
          type="search"
          placeholder="Buscar producto, cliente o comprobante"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </label>

      <Link
        to="/alertas"
        className="relative rounded-2xl bg-surface p-3 ring-1 ring-line transition-colors hover:ring-brand"
        aria-label={`${alertasActivas} alertas activas`}
      >
        <Bell className="size-5" />
        <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-sun text-[11px] font-bold text-sun-deep">
          {alertasActivas}
        </span>
      </Link>
    </header>
  )
}
