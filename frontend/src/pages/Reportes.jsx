import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useData } from '../context/DataContext'
import { tiempoPromedioAtencion, ventasPorHora } from '../data/mock'
import { Badge, MetricStrip, PageHeader, Panel, td, th } from '../components/ui'
import { diasHasta, soles } from '../utils/format'

const ejes = { axisLine: false, tickLine: false, tick: { fill: '#566a80', fontSize: 12, fontWeight: 600 } }
const tooltip = { borderRadius: 14, border: '1px solid #dbe6ec', fontFamily: 'Manrope' }

export default function Reportes() {
  const { productos, ventas, movimientos } = useData()

  const agotados = productos.filter((p) => p.stock <= 0).length
  const vencidos = productos.filter((p) => diasHasta(p.vence) < 0)
  const mermaVencidos = vencidos.reduce((s, p) => s + p.stock * p.precio, 0)
  const ajustes = movimientos.filter((m) => m.tipo === 'ajuste')
  const unidadesAjustadas = ajustes.reduce((s, m) => s + Math.abs(m.cantidad), 0)
  const stockTotal = productos.reduce((s, p) => s + p.stock, 0)
  const exactitud = stockTotal ? 100 - (unidadesAjustadas / stockTotal) * 100 : 100

  // Ventas por categoría a partir del detalle de cada venta
  const porCategoria = {}
  ventas.forEach((v) =>
    v.items.forEach((i) => {
      const cat = productos.find((p) => p.id === i.id)?.categoria ?? 'Otros'
      porCategoria[cat] = (porCategoria[cat] ?? 0) + i.precio * i.cantidad
    }),
  )
  const categorias = Object.entries(porCategoria)
    .map(([categoria, total]) => ({ categoria, total: Math.round(total * 100) / 100 }))
    .sort((a, b) => b.total - a.total)

  const indicadores = [
    { nombre: 'Tiempo promedio de atención', medida: 'Desde que se abre la venta hasta que se cobra', meta: '≤ 3:00 min', actual: `${tiempoPromedioAtencion} min`, ok: true },
    { nombre: 'Exactitud de inventario', medida: '100 % − unidades ajustadas en conteos / stock total', meta: '≥ 98 %', actual: `${exactitud.toFixed(1)} %`, ok: exactitud >= 98 },
    { nombre: 'Quiebres de stock', medida: 'Productos con stock en 0', meta: '0', actual: agotados, ok: agotados === 0 },
    { nombre: 'Merma por vencimiento', medida: 'Valor de productos vencidos en almacén', meta: 'S/ 0.00', actual: soles(mermaVencidos), ok: mermaVencidos === 0 },
    { nombre: 'Ventas registradas en sistema', medida: 'Ventas con comprobante / ventas totales', meta: '100 %', actual: '100 %', ok: true },
  ]

  return (
    <div className="space-y-6">
      <PageHeader description="Indicadores para medir si el sistema mejora la atención al cliente y reduce los errores de inventario." />

      <MetricStrip
        items={[
          { label: 'Tiempo promedio de atención', valor: `${tiempoPromedioAtencion} min`, nota: 'Antes del sistema: 6 min aprox.' },
          { label: 'Exactitud de inventario', valor: `${exactitud.toFixed(1)} %` },
          { label: 'Quiebres de stock', valor: agotados },
          { label: 'Merma por vencimiento', valor: soles(mermaVencidos) },
        ]}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="text-lg font-extrabold">Ventas por hora (promedio)</h2>
          <p className="mt-1 text-sm font-medium text-muted">Ayuda a decidir cuántos vendedores asignar por turno.</p>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ventasPorHora} margin={{ top: 4, right: 0, left: -16, bottom: 0 }}>
                <XAxis dataKey="hora" {...ejes} interval={1} />
                <YAxis {...ejes} />
                <Tooltip cursor={{ fill: '#dcf0f3' }} formatter={(v) => [soles(v), 'Ventas']} contentStyle={tooltip} />
                <Bar dataKey="total" fill="#7fc6d1" radius={[8, 8, 8, 8]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <h2 className="text-lg font-extrabold">Ventas por categoría</h2>
          <p className="mt-1 text-sm font-medium text-muted">Calculado desde las ventas registradas.</p>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorias} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
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
