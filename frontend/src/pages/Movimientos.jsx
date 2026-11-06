import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { Badge, Chips, EmptyRow, Field, Panel, Segmented, btn, inputCls, td, th } from '../components/ui'
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
    <div className="grid items-start gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <Panel className="xl:sticky xl:top-6">
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
            <select id="producto" value={productoId} onChange={(e) => setProductoId(e.target.value)} className={inputCls(false)}>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre} · stock {p.stock}</option>
              ))}
            </select>
          </Field>
          <Field label={etiquetaCantidad} htmlFor="cantidad">
            <input id="cantidad" type="number" min="0" value={cantidad} onChange={(e) => { setCantidad(e.target.value); setError('') }} className={inputCls(error)} />
          </Field>
          <Field label="Motivo" htmlFor="motivo">
            <select id="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} className={inputCls(false)}>
              {motivos[tipo].map((m) => <option key={m}>{m}</option>)}
            </select>
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

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-4">
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
        <div className="mt-4 overflow-x-auto">
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
