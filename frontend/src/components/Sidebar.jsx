import { NavLink } from 'react-router-dom'
import { LogOut, Plus, X } from 'lucide-react'
import { navItems } from '../config/nav'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const alertasActivas = useData().alertas.length
  const items = navItems.filter((i) => !i.roles || i.roles.includes(user?.rol))

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-ink/40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-brand-soft text-brand-deep transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:translate-x-0 lg:rounded-r-[36px] ${open ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between px-6 pt-7 pb-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-surface text-brand">
              <Plus strokeWidth={3} className="size-5" />
            </span>
            <div className="leading-tight">
              <p className="text-base font-extrabold">Nova Salud</p>
              <p className="text-xs font-semibold">Botica</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-surface/40 lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4">
          <ul className="space-y-1">
            {items.map(({ path, label, icon: Icon, end }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end={end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors ${isActive ? 'bg-surface text-brand-deep' : 'hover:bg-surface/35'
                    }`
                  }
                >
                  <Icon className="size-4.5" strokeWidth={2} />
                  <span className="flex-1">{label}</span>
                  {path === '/alertas' && (
                    <span className="rounded-full bg-sun px-2 py-0.5 text-xs font-bold text-sun-deep">
                      {alertasActivas}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="m-4 rounded-2xl bg-surface/45 p-4">
          <p className="truncate text-sm font-bold">{user?.nombre}</p>
          <p className="text-xs font-semibold capitalize">{user?.rol}</p>
          <button
            onClick={logout}
            className="mt-3 flex items-center gap-2 text-sm font-semibold hover:underline"
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
