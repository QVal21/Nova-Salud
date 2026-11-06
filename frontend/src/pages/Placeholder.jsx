import { useLocation } from 'react-router-dom'
import { navItems } from '../config/nav'

// Pantalla temporal para las secciones que aún no se maquetan
export default function Placeholder() {
  const { pathname } = useLocation()
  const item = navItems.find((i) => i.path === pathname)
  const Icon = item?.icon

  return (
    <section className="grid min-h-[50vh] place-items-center rounded-[28px] bg-surface p-10 text-center ring-1 ring-line">
      <div>
        {Icon && (
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-tint text-brand">
            <Icon className="size-7" />
          </span>
        )}
        <h2 className="mt-4 text-2xl font-extrabold">{item?.label ?? 'Sección'}</h2>
        <p className="mt-2 text-sm font-medium text-muted">Esta pantalla se maqueta en el siguiente paso.</p>
      </div>
    </section>
  )
}
