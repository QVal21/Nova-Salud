import { useState } from 'react'
import { Printer } from 'lucide-react'
import { useData } from '../context/DataContext'
import { Badge, Chips, EmptyRow, MetricStrip, Modal, Panel, SearchBox, btn, td, th } from '../components/ui'
import Boleta from '../components/Boleta'
import { diasDesde, esHoy, fechaHora, normalizar, soles } from '../utils/format'

export const metodoLabel = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', yape: 'Yape / Plin' }

export default function Ventas() {
  const { ventas } = useData()
  const [periodo, setPeriodo] = useState('7')
  const [q, setQ] = useState('')
  const [detalle, setDetalle] = useState(null)

  const lista = ventas.filter(
    (v) =>
      (periodo === 'todas' || (periodo === 'hoy' ? esHoy(v.fecha) : diasDesde(v.fecha) < 7)) &&
      normalizar(`${v.comprobante} ${v.cliente?.nombre ?? 'cliente varios'} ${v.cliente?.dni ?? ''}`).includes(normalizar(q)),
  )
  const total = lista.reduce((s, v) => s + v.total, 0)

  return (
    <div className="space-y-6">
      <MetricStrip
        items={[
          { label: 'Total vendido', valor: soles(total) },
          { label: 'Comprobantes', valor: lista.length },
          { label: 'Ticket promedio', valor: soles(lista.length ? total / lista.length : 0) },
        ]}
      />

      <Panel>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchBox value={q} onChange={setQ} placeholder="Buscar por comprobante, cliente o DNI" className="lg:w-96" />
          <Chips
            value={periodo}
            onChange={setPeriodo}
            options={[
              { value: 'hoy', label: 'Hoy' },
              { value: '7', label: 'Últimos 7 días' },
              { value: 'todas', label: 'Todas' },
            ]}
          />
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-line">
              <tr>
                <th className={th}>Comprobante</th>
                <th className={th}>Fecha</th>
                <th className={th}>Cliente</th>
                <th className={th}>Vendedor</th>
                <th className={th}>Pago</th>
                <th className={`${th} text-right`}>Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {lista.map((v) => (
                <tr key={v.id} onClick={() => setDetalle(v)} className="cursor-pointer transition-colors hover:bg-brand-tint/50">
                  <td className={`${td} font-num font-semibold text-brand`}>{v.comprobante}</td>
                  <td className={`${td} whitespace-nowrap text-muted`}>{fechaHora(v.fecha)}</td>
                  <td className={td}>{v.cliente?.nombre ?? 'Cliente varios'}</td>
                  <td className={`${td} text-muted`}>{v.vendedor}</td>
                  <td className={td}><Badge>{metodoLabel[v.metodo]}</Badge></td>
                  <td className={`${td} text-right font-num font-semibold`}>{soles(v.total)}</td>
                </tr>
              ))}
              {!lista.length && <EmptyRow cols={6} text="No hay ventas en este periodo." />}
            </tbody>
          </table>
        </div>
      </Panel>

      <DetalleVenta venta={detalle} onClose={() => setDetalle(null)} />
    </div>
  )
}

export function DetalleVenta({ venta, onClose }) {
  return (
    <Modal
      open={!!venta}
      title={venta ? `Comprobante ${venta.comprobante}` : ''}
      onClose={onClose}
      footer={
        <button onClick={() => window.print()} className={btn.secondary}>
          <Printer className="size-4" /> Imprimir
        </button>
      }
    >
      {venta && <Boleta venta={venta} />}
      {venta && (
        <div className="text-sm">
          <dl className="grid grid-cols-2 gap-3">
            <div><dt className="text-xs font-semibold text-muted">Fecha</dt><dd className="font-semibold">{fechaHora(venta.fecha)}</dd></div>
            <div><dt className="text-xs font-semibold text-muted">Tipo</dt><dd className="font-semibold capitalize">{venta.tipo}</dd></div>
            <div><dt className="text-xs font-semibold text-muted">Cliente</dt><dd className="font-semibold">{venta.cliente?.nombre ?? 'Cliente varios'}</dd></div>
            <div><dt className="text-xs font-semibold text-muted">Pago</dt><dd className="font-semibold">{metodoLabel[venta.metodo]}</dd></div>
          </dl>
          <ul className="mt-5 divide-y divide-line border-y border-line">
            {venta.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4 py-2.5">
                <span><span className="font-num font-semibold">{i.cantidad}</span> x {i.nombre} <span className="text-muted">({i.presentacion})</span></span>
                <span className="font-num">{soles(i.precio * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-muted"><span>Op. gravada</span><span className="font-num">{soles(venta.total / 1.18)}</span></div>
            <div className="flex justify-between text-muted"><span>IGV (18 %)</span><span className="font-num">{soles(venta.total - venta.total / 1.18)}</span></div>
            <div className="flex justify-between pt-1 text-lg font-extrabold"><span>Total</span><span className="font-num">{soles(venta.total)}</span></div>
          </div>
          <p className="mt-3 text-xs font-medium text-muted">Atendido por {venta.vendedor}</p>
        </div>
      )}
    </Modal>
  )
}
