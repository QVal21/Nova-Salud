import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PackagePlus, PackageX } from 'lucide-react'
import { useData, DIAS_ALERTA_VENCE } from '../context/DataContext'
import { Badge, Chips, EmptyRow, Field, Modal, PageHeader, Panel, btn, inputCls, td, th } from '../components/ui'
import { fechaCorta } from '../utils/format'

export default function Alertas() {
  const { alertas, pedidos, generarPedido } = useData()
  const navigate = useNavigate()
  const [filtro, setFiltro] = useState('todas')
  const [pidiendo, setPidiendo] = useState(null) // producto para el que se arma el pedido

  const lista = alertas.filter((a) => filtro === 'todas' || a.tipo === filtro)
  const pedidoPendiente = (productoId) => pedidos.some((p) => p.productoId === productoId && p.estado === 'pendiente')

  const detalleVence = (a) =>
    a.dias < 0 ? `Venció hace ${-a.dias} días` : a.dias === 0 ? 'Vence hoy' : `Vence en ${a.dias} días (${fechaCorta(a.vence)})`

  return (
    <div>
      <PageHeader
        description={`El sistema alerta cuando el stock llega al mínimo definido o cuando un lote vence en ${DIAS_ALERTA_VENCE} días o menos. Desde aquí se genera el pedido de reposición o se da de baja el producto.`}
      />

      <Panel>
        <Chips
          value={filtro}
          onChange={setFiltro}
          options={[
            { value: 'todas', label: 'Todas', count: alertas.length },
            { value: 'bajo', label: 'Stock bajo', count: alertas.filter((a) => a.tipo === 'bajo').length },
            { value: 'vence', label: 'Vencimiento', count: alertas.filter((a) => a.tipo === 'vence').length },
          ]}
        />

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-line">
              <tr>
                <th className={th}>Producto</th>
                <th className={th}>Motivo</th>
                <th className={th}>Detalle</th>
                <th className={th}>Proveedor</th>
                <th className={`${th} text-right`}>Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {lista.map((a) => (
                <tr key={a.key}>
                  <td className={td}>
                    <p className="font-bold">{a.nombre}</p>
                    <p className="text-xs font-medium text-muted">{a.presentacion} · Lote {a.lote}</p>
                  </td>
                  <td className={td}>
                    {a.tipo === 'bajo' ? (
                      <Badge variant="danger">{a.stock === 0 ? 'Agotado' : 'Stock bajo'}</Badge>
                    ) : (
                      <Badge variant={a.dias < 0 ? 'danger' : 'warning'}>{a.dias < 0 ? 'Vencido' : 'Por vencer'}</Badge>
                    )}
                  </td>
                  <td className={`${td} font-num`}>
                    {a.tipo === 'bajo' ? (
                      <>
                        {a.stock} de {a.minimo} mín.
                        <span className="block font-sans text-xs font-medium text-muted">Sugerido pedir: {Math.max(a.minimo * 2 - a.stock, a.minimo)} u.</span>
                      </>
                    ) : (
                      detalleVence(a)
                    )}
                  </td>
                  <td className={`${td} text-muted`}>{a.proveedorNombre}</td>
                  <td className={`${td} text-right`}>
                    {a.tipo === 'bajo' ? (
                      pedidoPendiente(a.id) ? (
                        <Badge variant="info">Pedido pendiente</Badge>
                      ) : (
                        <button onClick={() => setPidiendo(a)} className={btn.small}>
                          <PackagePlus className="size-3.5" /> Generar pedido
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => navigate('/movimientos', { state: { tipo: 'salida', productoId: a.id, motivo: 'Producto vencido' } })}
                        className={btn.small}
                      >
                        <PackageX className="size-3.5" /> Dar de baja
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!lista.length && <EmptyRow cols={5} text="No hay alertas activas. El inventario está en orden." />}
            </tbody>
          </table>
        </div>
      </Panel>

      {pidiendo && (
        <PedidoModal
          producto={pidiendo}
          onClose={() => setPidiendo(null)}
          onConfirm={async (cantidad) => {
            await generarPedido(pidiendo, cantidad)
            setPidiendo(null)
          }}
        />
      )}
    </div>
  )
}

function PedidoModal({ producto, onClose, onConfirm }) {
  const sugerido = Math.max(producto.minimo * 2 - producto.stock, producto.minimo, 1)
  const [cantidad, setCantidad] = useState(String(sugerido))
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const confirmar = async (e) => {
    e.preventDefault()
    const n = Number(cantidad)
    if (!Number.isInteger(n) || n <= 0) return setError('Ingresa una cantidad entera mayor a 0')
    setEnviando(true)
    try {
      await onConfirm(n)
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  return (
    <Modal
      open
      title="Generar pedido de reposición"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className={btn.secondary}>Cancelar</button>
          <button onClick={confirmar} disabled={enviando} className={`${btn.primary} disabled:opacity-70`}>
            {enviando ? 'Enviando…' : 'Enviar pedido'}
          </button>
        </>
      }
    >
      <form onSubmit={confirmar} noValidate>
        <p className="font-bold">{producto.nombre}</p>
        <p className="text-sm font-medium text-muted">{producto.presentacion} · {producto.proveedorNombre}</p>

        <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-line ring-1 ring-line text-center">
          <div className="bg-surface p-3"><dt className="text-xs font-semibold text-muted">Stock actual</dt><dd className="font-num text-lg font-semibold">{producto.stock}</dd></div>
          <div className="bg-surface p-3"><dt className="text-xs font-semibold text-muted">Mínimo</dt><dd className="font-num text-lg font-semibold">{producto.minimo}</dd></div>
          <div className="bg-surface p-3"><dt className="text-xs font-semibold text-muted">Sugerido</dt><dd className="font-num text-lg font-semibold">{sugerido}</dd></div>
        </dl>

        <div className="mt-5">
          <Field label="Cantidad a pedir" htmlFor="cantidad-pedido" error={error} hint="Una vez enviado, el pedido ya no se puede modificar.">
            <input
              id="cantidad-pedido"
              type="number"
              min="1"
              step="1"
              autoFocus
              value={cantidad}
              onChange={(e) => { setCantidad(e.target.value); setError('') }}
              className={inputCls(error)}
            />
          </Field>
        </div>
      </form>
    </Modal>
  )
}