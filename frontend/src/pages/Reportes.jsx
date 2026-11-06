import { useEffect, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useData } from '../context/DataContext'
import { api } from '../services/api'
import { Badge, MetricStrip, PageHeader, Panel, td, th } from '../components/ui'
import { duracion, soles } from '../utils/format'

const ejes = { axisLine: false, tickLine: false, tick: { fill: '#566a80', fontSize: 12, fontWeight: 600 } }
const tooltip = { borderRadius: 14, border: '1px solid #dbe6ec', fontFamily: 'Manrope' }
const META_ATENCION = 180 // 3 minutos

export default function Reportes() {
  const { setError } = useData()
  const [ind, setInd] = useState(null)

  useEffect(() => {
    api.get('/reportes/indicadores').then(setInd).catch((e) => setError(e.message))
  }, [setError])

  if (!ind) return <p className="py-24 text-center text-sm font-semibold text-muted">Calculando indicadores…</p>

  const porHora = ind.ventasPorHora.map((h) => ({ ...h, hora: `${h.hora} h` }))

  const indicadores = [
    {
      nombre: 'Tiempo promedio de atención',
      medida: 'Desde que se agrega el primer producto hasta que se cobra',
      meta: '≤ 3:00 min',
      actual: duracion(ind.tiempoPromedioSegundos),
      ok: ind.tiempoPromedioSegundos != null && ind.tiempoPromedioSegundos <= META_ATENCION,
    },
    {
      nombre: 'Exactitud de inventario',
      medida: '100 % − unidades corregidas en conteos / stock total',
      meta: '≥ 98 %',
      actual: `${ind.exactitudInventario.toFixed(1)} %`,
      ok: ind.exactitudInventario >= 98,
    },
    { nombre: 'Quiebres de stock', medida: 'Productos con stock en 0', meta: '0', actual: ind.quiebresStock, ok: ind.quiebresStock === 0 },
    { nombre: 'Merma por vencimiento', medida: 'Valor de productos vencidos en almacén', meta: 'S/ 0.00', actual: soles(ind.mermaVencimiento), ok: ind.mermaVencimiento === 0 },
    { nombre: 'Ventas registradas en sistema', medida: 'Toda venta genera comprobante y descuenta stock', meta: '100 %', actual: '100 %', ok: true },
  ]

  return (
    <div className="space-y-6">
      <PageHeader description={`Indicadores de los últimos ${ind.periodoDias} días para medir si el sistema mejora la atención al cliente y reduce los errores de inventario.`} />

      <MetricStrip
        items={[
          { label: 'Tiempo promedio de atención', valor: duracion(ind.tiempoPromedioSegundos) },
          { label: 'Exactitud de inventario', valor: `${ind.exactitudInventario.toFixed(1)} %` },
          { label: 'Quiebres de stock', valor: ind.quiebresStock },
          { label: 'Merma por vencimiento', valor: soles(ind.mermaVencimiento) },
        ]}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="text-lg font-extrabold">Ventas por hora</h2>
          <p className="mt-1 text-sm font-medium text-muted">Ayuda a decidir cuántos vendedores asignar por turno.</p>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porHora} margin={{ top: 4, right: 0, left: -16, bottom: 0 }}>
                <XAxis dataKey="hora" {...ejes} />
                <YAxis {...ejes} />
                <Tooltip cursor={{ fill: '#dcf0f3' }} formatter={(v) => [soles(v), 'Ventas']} contentStyle={tooltip} />
                <Bar dataKey="total" fill="#7fc6d1" radius={[8, 8, 8, 8]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <h2 className="text-lg font-extrabold">Ventas por categoría</h2>
          <p className="mt-1 text-sm font-medium text-muted">Calculado desde el detalle de cada venta.</p>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ind.ventasPorCategoria} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
                <XAxis type="number" {...ejes} />
                <YAxis type="category" dataKey="categoria" {...ejes} width={120} />
                <Tooltip cursor={{ fill: '#dcf0f3' }} formatter={(v) => [soles(v), 'Ventas']} contentStyle={tooltip} />
                <Bar dataKey="total" fill="#237c8c" radius={[8, 8, 8, 8]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </section>

      <Panel>
        <h2 className="text-lg font-extrabold">Indicadores de efectividad</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-line">
              <tr>
                <th className={th}>Indicador</th>
                <th className={th}>Cómo se mide</th>
                <th className={th}>Meta</th>
                <th className={th}>Actual</th>
                <th className={th}>Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {indicadores.map((i) => (
                <tr key={i.nombre}>
                  <td className={`${td} font-bold`}>{i.nombre}</td>
                  <td className={`${td} text-muted`}>{i.medida}</td>
                  <td className={`${td} font-num`}>{i.meta}</td>
                  <td className={`${td} font-num font-semibold`}>{i.actual}</td>
                  <td className={td}>{i.ok ? <Badge variant="success">Cumple</Badge> : <Badge variant="warning">Por mejorar</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
