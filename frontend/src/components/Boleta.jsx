import { createPortal } from 'react-dom'
import { soles } from '../utils/format'

const metodoLabel = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', yape: 'Yape / Plin' }

const fechaTicket = (iso) =>
  new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

// Boleta de venta en formato ticket (80 mm). En pantalla está oculta: solo se ve al imprimir.
// Se dibuja fuera de #root (portal) para que, al imprimir, el resto de la aplicación se oculte y salga solo el ticket.
export default function Boleta({ venta, vuelto }) {
  if (!venta) return null

  const esFactura = venta.tipo === 'factura'
  const registrado = !!venta.cliente?.id
  const documento = venta.cliente?.dni
  const gravada = venta.total / 1.18

  const ticket = (
    <div className="boleta-print">
      <div className="text-center">
        <img src="/logo.png" alt="Nova Salud Botica" className="mx-auto h-12 w-auto grayscale" />
        <p className="mt-1 text-sm font-bold uppercase">Nova Salud Botica</p>
      </div>

      <div className="my-2 border-y border-dashed border-black py-1.5 text-center">
        <p className="font-bold uppercase">{esFactura ? 'Factura de venta' : 'Boleta de venta'}</p>
        <p className="font-bold">{venta.comprobante}</p>
      </div>

      <dl className="space-y-0.5">
        <div className="flex justify-between gap-2"><dt>Fecha y hora:</dt><dd>{fechaTicket(venta.fecha)}</dd></div>
        <div className="flex justify-between gap-2"><dt>Atendido por:</dt><dd className="text-right">{venta.vendedor}</dd></div>
        {registrado && <div className="flex justify-between gap-2"><dt>Cliente:</dt><dd className="text-right">{venta.cliente.nombre}</dd></div>}
        {documento && <div className="flex justify-between gap-2"><dt>{esFactura ? 'RUC:' : 'DNI:'}</dt><dd>{documento}</dd></div>}
        <div className="flex justify-between gap-2"><dt>Pago:</dt><dd>{metodoLabel[venta.metodo] ?? venta.metodo}</dd></div>
      </dl>

      <table className="mt-2 w-full border-t border-dashed border-black">
        <thead>
          <tr className="text-left">
            <th className="py-1 pr-1 font-bold">Cant.</th>
            <th className="py-1 font-bold">Descripción</th>
            <th className="py-1 pl-1 text-right font-bold">Importe</th>
          </tr>
        </thead>
        <tbody>
          {venta.items.map((i) => (
            <tr key={i.id} className="align-top">
              <td className="py-0.5 pr-1">{i.cantidad}</td>
              <td className="py-0.5">
                {i.nombre}
                <span className="block text-[10px]">{i.presentacion} · {soles(i.precio)} c/u</span>
              </td>
              <td className="py-0.5 pl-1 text-right">{soles(i.precio * i.cantidad)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-1 space-y-0.5 border-t border-dashed border-black pt-1.5">
        <div className="flex justify-between"><span>Op. gravada</span><span>{soles(gravada)}</span></div>
        <div className="flex justify-between"><span>IGV (18 %)</span><span>{soles(venta.total - gravada)}</span></div>
        <div className="flex justify-between text-sm font-bold"><span>TOTAL</span><span>{soles(venta.total)}</span></div>
        {vuelto != null && venta.metodo === 'efectivo' && (
          <>
            <div className="flex justify-between"><span>Recibido</span><span>{soles(venta.total + vuelto)}</span></div>
            <div className="flex justify-between"><span>Vuelto</span><span>{soles(vuelto)}</span></div>
          </>
        )}
      </div>

      <p className="mt-3 border-t border-dashed border-black pt-2 text-center font-bold">¡Gracias por su compra!</p>
    </div>
  )

  return createPortal(ticket, document.body)
}
