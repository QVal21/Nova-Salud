import { Link } from 'react-router-dom'
import { ArrowRight, CalendarClock, PackageMinus, Plus } from 'lucide-react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAuth } from '../context/AuthContext'
import {
  alertasActivas,
  alertasPorVencer,
  alertasStockBajo,
  masVendidos,
  resumenHoy,
  soles,
  stockCritico,
  ventasSemana,
} from '../data/mock'

const metricas = [
  { label: 'Ventas de hoy', valor: soles(resumenHoy.ventas) },
  { label: 'Comprobantes emitidos', valor: resumenHoy.comprobantes },
  { label: 'Tiempo promedio de atención', valor: `${resumenHoy.tiempoPromedio} min` },
  { label: 'Productos en alerta', valor: alertasActivas },
]

const fechaCorta = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })

export default function Dashboard() {
  const { user } = useAuth()
  const maxUnidades = Math.max(...masVendidos.map((p) => p.unidades))

  return (
    <div className="space-y-6">
      {/* Fila 1: bienvenida + resumen de alertas */}
      <section className="grid gap-6 lg:grid-cols-5">
        <div className="relative overflow-hidden rounded-[28px] bg-brand p-7 text-surface lg:col-span-3">
          <Plus
            aria-hidden="true"
            strokeWidth={2.5}
            className="pointer-events-none absolute -right-6 -bottom-10 size-56 text-surface/10"
          />
          <p className="text-sm font-semibold text-brand-tint">Turno de {user?.nombre}</p>
          <h2 className="mt-2 max-w-md text-2xl leading-snug font-extrabold sm:text-3xl">
            Hoy van {resumenHoy.comprobantes} ventas y {alertasActivas} productos necesitan atención.
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/punto-venta"
              className="inline-flex items-center gap-2 rounded-2xl bg-surface px-5 py-3 text-sm font-bold text-brand-deep transition-colors hover:bg-brand-tint"
            >
              <Plus className="size-4" strokeWidth={3} />
              Nueva venta
            </Link>
            <Link
              to="/alertas"
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold ring-1 ring-surface/60 transition-colors hover:bg-surface/10"
            >
              Ver alertas
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col rounded-[28px] bg-sky p-7 text-sky-deep lg:col-span-2">
          <h2 className="text-xl font-extrabold">Alertas de inventario</h2>
          <p className="mt-1 text-sm font-semibold">Productos que requieren reposición o revisión</p>

          <div className="mt-6 space-y-5">
            <AlertaBarra icon={PackageMinus} label="Stock bajo" valor={alertasStockBajo} total={alertasActivas} color="bg-danger" />
            <AlertaBarra icon={CalendarClock} label="Por vencer (30 días)" valor={alertasPorVencer} total={alertasActivas} color="bg-sun" />
          </div>

          <Link to="/alertas" className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold hover:underline">
            Revisar alertas <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Fila 2: métricas en una sola franja */}
      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-[28px] bg-line ring-1 ring-line lg:grid-cols-4">
        {metricas.map((m) => (
          <div key={m.label} className="bg-surface p-6">
            <p className="text-sm font-semibold text-muted">{m.label}</p>
            <p className="mt-2 font-num text-2xl font-semibold sm:text-3xl">{m.valor}</p>
          </div>
        ))}
      </section>

      {/* Fila 3: gráfico + más vendidos */}
      <section className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-[28px] bg-surface p-6 ring-1 ring-line lg:col-span-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-extrabold">Ventas de los últimos 7 días</h2>
            <span className="font-num text-sm font-semibold text-muted">
              {soles(ventasSemana.reduce((s, d) => s + d.total, 0))}
            </span>
          </div>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ventasSemana} margin={{ top: 4, right: 0, left: -12, bottom: 0 }}>
                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: '#566a80', fontSize: 12, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#566a80', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#dcf0f3' }}
                  formatter={(v) => [soles(v), 'Ventas']}
                  contentStyle={{ borderRadius: 14, border: '1px solid #dbe6ec', fontFamily: 'Manrope' }}
                />
                <Bar dataKey="total" radius={[10, 10, 10, 10]} maxBarSize={36}>
                  {ventasSemana.map((d) => (
                    <Cell key={d.dia} fill={d.dia === 'Hoy' ? '#237c8c' : '#7fc6d1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[28px] bg-surface p-6 ring-1 ring-line lg:col-span-2">
          <h2 className="text-lg font-extrabold">Más vendidos esta semana</h2>
          <ol className="mt-4 divide-y divide-line">
            {masVendidos.map((p, i) => (
              <li key={p.nombre} className="flex items-center gap-4 py-3">
                <span className="font-num text-sm font-semibold text-muted">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{p.nombre}</p>
                  <div className="mt-1.5 h-1.5 rounded-full bg-brand-tint">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${(p.unidades / maxUnidades) * 100}%` }} />
                  </div>
                </div>
                <span className="font-num text-sm font-semibold">{p.unidades} u.</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Fila 4: stock crítico */}
      <section className="rounded-[28px] bg-surface p-6 ring-1 ring-line">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-extrabold">Stock crítico</h2>
          <Link to="/inventario" className="text-sm font-bold text-brand hover:underline">Ir a inventario</Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted">
                <th className="py-2 font-semibold">Producto</th>
                <th className="py-2 font-semibold">Lote</th>
                <th className="py-2 font-semibold">Motivo</th>
                <th className="py-2 font-semibold">Detalle</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {stockCritico.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 font-bold">{p.nombre}</td>
                  <td className="py-3 font-num text-muted">{p.lote}</td>
                  <td className="py-3">
                    {p.tipo === 'bajo' ? (
                      <span className="rounded-full bg-danger-tint px-3 py-1 text-xs font-bold text-danger-deep">Stock bajo</span>
                    ) : (
                      <span className="rounded-full bg-sun-tint px-3 py-1 text-xs font-bold text-sun-deep">Por vencer</span>
                    )}
                  </td>
                  <td className="py-3 font-num">
                    {p.tipo === 'bajo' ? `${p.stock} de ${p.minimo} mín.` : `Vence ${fechaCorta(p.vence)}`}
                  </td>
                  <td className="py-3 text-right">
                    <button className="rounded-xl px-3 py-1.5 text-xs font-bold text-brand ring-1 ring-line transition-colors hover:bg-brand-tint">
                      {p.tipo === 'bajo' ? 'Reponer' : 'Revisar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function AlertaBarra({ icon: Icon, label, valor, total, color }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm font-bold">
        <span className="flex items-center gap-2">
          <Icon className="size-4" />
          {label}
        </span>
        <span className="font-num">{valor}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-surface/50">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${(valor / total) * 100}%` }} />
      </div>
    </div>
  )
}
