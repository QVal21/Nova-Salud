import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { Badge, Chips, Dropdown, EmptyRow, Field, Panel, Segmented, btn, inputCls, td, th } from '../components/ui'
import { fechaHora } from '../utils/format'

const motivos = {
  entrada: ['Compra a proveedor', 'Devolución de cliente', 'Otro'],
  salida: ['Producto vencido', 'Producto dañado', 'Uso interno', 'Otro'],
  ajuste: ['Conteo físico'],
}

const tipoBadge = {
  entrada: <Badge variant="success">Entrada</Badge>,
  salida: <Badge variant="danger">Salida</Badge>,
  ajuste: <Badge variant="info">Ajuste</Badge>,
}

export default function Movimientos() {
  const { user } = useAuth()
  const esAdmin = user?.rol === 'admin'
  const { productos, movimientos, registrarMovimiento } = useData()
  const [enviando, setEnviando] = useState(false)
  const { state } = useLocation() // permite llegar desde Alertas con el producto ya elegido

  const [tipo, setTipo] = useState(state?.tipo ?? 'entrada')
  const [productoId, setProductoId] = useState(state?.productoId ?? productos[0]?.id)
  const [cantidad, setCantidad] = useState('')
  const [motivo, setMotivo] = useState(state?.motivo ?? motivos[state?.tipo ?? 'entrada'][0])
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [filtro, setFiltro] = useState('todos')

  const producto = productos.find((p) => p.id === productoId)
  const n = Number(cantidad)
  const stockFinal = !producto || cantidad === '' ? null : tipo === 'entrada' ? producto.stock + n : tipo === 'salida' ? producto.stock - n : n

  const cambiarTipo = (t) => {
    setTipo(t)
    setMotivo(motivos[t][0])
    setError('')
  }

  const registrar = async (e) => {
    e.preventDefault()
    if (enviando) return
    setAviso('')
    if (!producto) return setError('Selecciona un producto.')
    if (!Number.isInteger(n) || n < 0 || cantidad === '') return setError('Ingresa una cantidad entera válida.')
    if (tipo !== 'ajuste' && n === 0) return setError('La cantidad debe ser mayor a 0.')
    if (tipo === 'salida' && n > producto.stock) return setError(`Solo hay ${producto.stock} unidades en stock.`)
    setEnviando(true)
    try {
      const mov = await registrarMovimiento({ tipo, productoId: producto.id, cantidad: n, motivo })
      setAviso(`Movimiento registrado. ${producto.nombre} queda con ${mov.stockFinal} unidades.`)
      setCantidad('')
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const lista = movimientos.filter((m) => filtro === 'todos' || m.tipo === filtro)

  const etiquetaCantidad = { entrada: 'Cantidad que ingresa', salida: 'Cantidad que sale', ajuste: 'Cantidad contada físicamente' }[tipo]

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <Panel className="min-w-0 xl:sticky xl:top-6">
        <h2 className="text-lg font-extrabold">Registrar movimiento</h2>
        <p className="mt-1 text-sm font-medium text-muted">Cada cambio de stock queda registrado con usuario, fecha y motivo.</p>

        <form onSubmit={registrar} noValidate className="mt-5 space-y-4">
          <Segmented
            value={tipo}
            onChange={cambiarTipo}
            options={[
              { value: 'entrada', label: 'Entrada' },
              { value: 'salida', label: 'Salida' },
              ...(esAdmin ? [{ value: 'ajuste', label: 'Ajuste' }] : []),
            ]}
          />
          <Field label="Producto" htmlFor="producto">
            <Dropdown
              id="producto"
              options={productos.map((p) => ({ value: p.id, label: `${p.nombre} · stock ${p.stock}` }))}
              value={productoId}
              onChange={setProductoId}
            />
          </Field>
          <Field label={etiquetaCantidad} htmlFor="cantidad">
            <input id="cantidad" type="number" min="0" value={cantidad} onChange={(e) => { setCantidad(e.target.value); setError('') }} className={inputCls(error)} />
          </Field>
          <Field label="Motivo" htmlFor="motivo">
            <Dropdown
              id="motivo"
              options={motivos[tipo].map((m) => ({ value: m, label: m }))}
              value={motivo}
              onChange={setMotivo}
            />
          </Field>

          {producto && (
            <div className="flex items-center justify-between rounded-2xl bg-page px-4 py-3 font-num text-sm font-semibold">
              <span className="font-sans text-muted">Stock</span>
              <span className="flex items-center gap-2">
                {producto.stock}
                <ArrowRight className="size-4 text-muted" />
                <span className={stockFinal != null && stockFinal < 0 ? 'text-danger' : 'text-brand'}>{stockFinal ?? '—'}</span>
              </span>
            </div>
          )}

          {error && <p className="text-sm font-semibold text-danger">{error}</p>}
          {aviso && <p className="text-sm font-semibold text-brand">{aviso}</p>}

          <button type="submit" disabled={enviando} className={`${btn.primary} w-full disabled:opacity-70`}>
            {enviando ? 'Registrando…' : 'Registrar movimiento'}
          </button>
        </form>
      </Panel>

      <Panel className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <h2 className="text-lg font-extrabold">Historial</h2>
          <Chips
            value={filtro}
            onChange={setFiltro}
            options={[
              { value: 'todos', label: 'Todos' },
              { value: 'entrada', label: 'Entradas' },
              { value: 'salida', label: 'Salidas' },
              { value: 'ajuste', label: 'Ajustes' },
            ]}
          />
        </div>
        {/* Celular: una tarjeta por movimiento */}
        <ul className="mt-4 divide-y divide-line md:hidden">
          {lista.map((m) => (
            <li key={m.id} className="py-3.5">
              <div className="flex items-center justify-between gap-3">
                {tipoBadge[m.tipo]}
                <span className="text-xs font-medium text-muted">{fechaHora(m.fecha)}</span>
              </div>
              <div className="mt-2 flex items-start justify-between gap-3">
                <p className="min-w-0 flex-1 text-sm font-bold">{m.productoNombre}</p>
                <div className="shrink-0 text-right">
                  <p className={`font-num text-base font-semibold ${m.cantidad < 0 ? 'text-danger' : 'text-brand'}`}>
                    {m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}
                  </p>
                  <p className="font-num text-xs font-medium text-muted">Stock: {m.stockFinal}</p>
                </div>
              </div>
              <p className="mt-1 text-xs font-medium text-muted">
                {m.motivo} · {m.usuario}
              </p>
            </li>
          ))}
          {!lista.length && <li className="py-10 text-center text-sm font-medium text-muted">No hay movimientos registrados.</li>}
        </ul>

        {/* Pantallas medianas y grandes: tabla */}
        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-line">
              <tr>
                <th className={th}>Fecha</th>
                <th className={th}>Tipo</th>
                <th className={th}>Producto</th>
                <th className={`${th} text-right`}>Cantidad</th>
                <th className={`${th} text-right`}>Stock final</th>
                <th className={th}>Motivo</th>
                <th className={th}>Usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {lista.map((m) => (
                <tr key={m.id}>
                  <td className={`${td} whitespace-nowrap text-muted`}>{fechaHora(m.fecha)}</td>
                  <td className={td}>{tipoBadge[m.tipo]}</td>
                  <td className={`${td} font-bold`}>{m.productoNombre}</td>
                  <td className={`${td} text-right font-num font-semibold ${m.cantidad < 0 ? 'text-danger' : 'text-brand'}`}>
                    {m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}
                  </td>
                  <td className={`${td} text-right font-num`}>{m.stockFinal}</td>
                  <td className={td}>{m.motivo}</td>
                  <td className={`${td} text-muted`}>{m.usuario}</td>
                </tr>
              ))}
              {!lista.length && <EmptyRow cols={7} text="No hay movimientos registrados." />}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
