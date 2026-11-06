import { useRef, useState } from 'react'
import { CheckCircle2, Minus, Plus, Printer, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { Badge, Chips, Field, Modal, SearchBox, Segmented, btn, inputCls } from '../components/ui'
import { normalizar, soles } from '../utils/format'

const metodos = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'yape', label: 'Yape / Plin' },
]

export default function PuntoVenta() {
  const { user } = useAuth()
  const { productos, clientes, registrarVenta } = useData()
  const busquedaRef = useRef(null)

  const [q, setQ] = useState('')
  const [categoria, setCategoria] = useState('Todas')
  const [carrito, setCarrito] = useState([])
  const [tipo, setTipo] = useState('boleta')
  const [documento, setDocumento] = useState('')
  const [metodo, setMetodo] = useState('efectivo')
  const [recibido, setRecibido] = useState('')
  const [error, setError] = useState('')
  const [ventaHecha, setVentaHecha] = useState(null)

  const categorias = ['Todas', ...new Set(productos.map((p) => p.categoria))]
  const lista = productos.filter(
    (p) =>
      (categoria === 'Todas' || p.categoria === categoria) &&
      normalizar(`${p.nombre} ${p.codigo} ${p.laboratorio}`).includes(normalizar(q)),
  )

  const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0)
  const gravada = total / 1.18
  const igv = total - gravada
  const cliente = documento.length === 8 ? clientes.find((c) => c.dni === documento) : null
  const vuelto = metodo === 'efectivo' && recibido !== '' ? Number(recibido) - total : null
  const necesitaReceta = carrito.some((i) => i.receta)

  const agregar = (p) => {
    if (p.stock <= 0) return
    setError('')
    setCarrito((c) => {
      const existe = c.find((i) => i.id === p.id)
      if (existe) {
        return existe.cantidad >= p.stock ? c : c.map((i) => (i.id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i))
      }
      return [...c, { id: p.id, nombre: p.nombre, presentacion: p.presentacion, precio: p.precio, receta: p.receta, stock: p.stock, cantidad: 1 }]
    })
  }

  const cambiarCantidad = (id, delta) =>
    setCarrito((c) =>
      c.flatMap((i) => {
        if (i.id !== id) return [i]
        const n = i.cantidad + delta
        if (n <= 0) return []
        return [{ ...i, cantidad: Math.min(n, i.stock) }]
      }),
    )

  // Enter en el buscador agrega el primer resultado: atención más rápida
  const alPresionar = (e) => {
    if (e.key === 'Enter' && lista[0]) {
      agregar(lista[0])
      setQ('')
    }
  }

  const cobrar = () => {
    if (!carrito.length) return setError('Agrega al menos un producto.')
    if (tipo === 'factura' && !/^\d{11}$/.test(documento)) return setError('Para factura ingresa un RUC de 11 dígitos.')
    if (documento && tipo === 'boleta' && !/^\d{8}$/.test(documento)) return setError('El DNI debe tener 8 dígitos.')
    if (metodo === 'efectivo' && recibido !== '' && Number(recibido) < total) return setError('El monto recibido no cubre el total.')

    const datosCliente = cliente
      ? { id: cliente.id, nombre: cliente.nombre, dni: cliente.dni }
      : documento
        ? { nombre: tipo === 'factura' ? `RUC ${documento}` : `DNI ${documento}`, dni: documento }
        : null

    const venta = registrarVenta({
      items: carrito.map(({ stock, receta, ...i }) => i),
      cliente: datosCliente,
      tipo,
      metodo,
      vendedor: user?.nombre,
    })
    setVentaHecha({ ...venta, vuelto })
  }

  const nuevaVenta = () => {
    setCarrito([])
    setDocumento('')
    setRecibido('')
    setTipo('boleta')
    setMetodo('efectivo')
    setError('')
    setQ('')
    setVentaHecha(null)
    setTimeout(() => busquedaRef.current?.focus(), 0)
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
      {/* Catálogo */}
      <section className="rounded-[28px] bg-surface p-6 ring-1 ring-line">
        <SearchBox
          inputRef={busquedaRef}
          autoFocus
          value={q}
          onChange={setQ}
          onKeyDown={alPresionar}
          placeholder="Busca por nombre, código o laboratorio y presiona Enter"
        />
        <div className="mt-4">
          <Chips options={categorias.map((c) => ({ value: c, label: c }))} value={categoria} onChange={setCategoria} />
        </div>

        <ul className="mt-4 divide-y divide-line">
          {lista.map((p) => {
            const agotado = p.stock <= 0
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => agregar(p)}
                  disabled={agotado}
                  className="flex w-full items-center gap-4 rounded-2xl px-2 py-3 text-left transition-colors hover:bg-brand-tint/60 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold">{p.nombre}</p>
                      {p.receta && <Badge variant="info">Con receta</Badge>}
                    </div>
                    <p className="mt-0.5 text-xs font-medium text-muted">
                      {p.presentacion} · {p.laboratorio} · {p.codigo}
                    </p>
                  </div>
                  <span className={`font-num text-sm font-semibold ${agotado || p.stock <= p.minimo ? 'text-danger' : 'text-muted'}`}>
                    {agotado ? 'Agotado' : `${p.stock} u.`}
                  </span>
                  <span className="w-20 text-right font-num font-semibold">{soles(p.precio)}</span>
                  <span className={`grid size-9 place-items-center rounded-xl ${agotado ? 'text-muted' : 'bg-brand text-surface'}`}>
                    <Plus className="size-4" strokeWidth={3} />
                  </span>
                </button>
              </li>
            )
          })}
          {!lista.length && <li className="py-10 text-center text-sm font-medium text-muted">No hay productos que coincidan.</li>}
        </ul>
      </section>

      {/* Venta actual */}
      <aside className="rounded-[28px] bg-surface p-6 ring-1 ring-line xl:sticky xl:top-6">
        <h2 className="text-lg font-extrabold">Venta actual</h2>

        <div className="mt-4 space-y-4">
          <Segmented
            options={[
              { value: 'boleta', label: 'Boleta' },
              { value: 'factura', label: 'Factura' },
            ]}
            value={tipo}
            onChange={setTipo}
          />
          <Field label={tipo === 'factura' ? 'RUC del cliente' : 'DNI del cliente (opcional)'} htmlFor="documento">
            <input
              id="documento"
              inputMode="numeric"
              maxLength={tipo === 'factura' ? 11 : 8}
              value={documento}
              onChange={(e) => setDocumento(e.target.value.replace(/\D/g, ''))}
              placeholder={tipo === 'factura' ? '20512345671' : '45871236'}
              className={inputCls(false)}
            />
          </Field>
          {cliente && <p className="-mt-2 text-xs font-bold text-brand">Cliente registrado: {cliente.nombre}</p>}
        </div>

        <ul className="mt-5 divide-y divide-line border-y border-line">
          {carrito.map((i) => (
            <li key={i.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{i.nombre}</p>
                <p className="text-xs font-medium text-muted">{soles(i.precio)} c/u</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => cambiarCantidad(i.id, -1)} className="grid size-7 place-items-center rounded-lg ring-1 ring-line hover:bg-brand-tint" aria-label="Quitar uno">
                  <Minus className="size-3.5" />
                </button>
                <span className="w-7 text-center font-num text-sm font-semibold">{i.cantidad}</span>
                <button onClick={() => cambiarCantidad(i.id, 1)} className="grid size-7 place-items-center rounded-lg ring-1 ring-line hover:bg-brand-tint" aria-label="Agregar uno">
                  <Plus className="size-3.5" />
                </button>
              </div>
              <span className="w-20 text-right font-num text-sm font-semibold">{soles(i.precio * i.cantidad)}</span>
              <button onClick={() => cambiarCantidad(i.id, -i.cantidad)} className="text-muted hover:text-danger" aria-label={`Eliminar ${i.nombre}`}>
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
          {!carrito.length && <li className="py-8 text-center text-sm font-medium text-muted">Selecciona productos del catálogo.</li>}
        </ul>

        {necesitaReceta && (
          <p className="mt-3 rounded-2xl bg-sky/30 px-4 py-2.5 text-xs font-bold text-sky-deep">
            Hay productos que requieren receta médica. Verifícala antes de cobrar.
          </p>
        )}

        <dl className="mt-4 space-y-1.5 text-sm">
          <div className="flex justify-between font-medium text-muted"><dt>Op. gravada</dt><dd className="font-num">{soles(gravada)}</dd></div>
          <div className="flex justify-between font-medium text-muted"><dt>IGV (18 %)</dt><dd className="font-num">{soles(igv)}</dd></div>
          <div className="flex justify-between pt-1 text-lg font-extrabold"><dt>Total</dt><dd className="font-num">{soles(total)}</dd></div>
        </dl>

        <div className="mt-5 space-y-4">
          <Segmented options={metodos} value={metodo} onChange={setMetodo} />
          {metodo === 'efectivo' && (
            <div className="grid grid-cols-2 items-end gap-3">
              <Field label="Recibido" htmlFor="recibido">
                <input id="recibido" type="number" min="0" step="0.1" value={recibido} onChange={(e) => setRecibido(e.target.value)} placeholder="0.00" className={inputCls(false)} />
              </Field>
              <div className="pb-3 text-right">
                <p className="text-xs font-semibold text-muted">Vuelto</p>
                <p className={`font-num text-lg font-semibold ${vuelto < 0 ? 'text-danger' : ''}`}>{vuelto == null ? '—' : soles(vuelto)}</p>
              </div>
            </div>
          )}
        </div>

        {error && <p className="mt-4 text-sm font-semibold text-danger">{error}</p>}

        <button onClick={cobrar} className={`${btn.primary} mt-5 w-full py-4 text-base`}>
          Cobrar {soles(total)}
        </button>
      </aside>

      <Modal
        open={!!ventaHecha}
        title="Venta registrada"
        onClose={nuevaVenta}
        footer={
          <>
            <button onClick={() => window.print()} className={btn.secondary}>
              <Printer className="size-4" /> Imprimir
            </button>
            <button onClick={nuevaVenta} className={btn.primary}>Nueva venta</button>
          </>
        }
      >
        {ventaHecha && (
          <div>
            <div className="flex items-center gap-3 text-brand">
              <CheckCircle2 className="size-6" />
              <p className="font-num text-lg font-semibold">{ventaHecha.comprobante}</p>
            </div>
            <p className="mt-1 text-sm font-medium text-muted">
              {ventaHecha.cliente?.nombre ?? 'Cliente varios'} · {metodos.find((m) => m.value === ventaHecha.metodo)?.label}
            </p>
            <ul className="mt-4 divide-y divide-line text-sm">
              {ventaHecha.items.map((i) => (
                <li key={i.id} className="flex justify-between py-2">
                  <span>{i.cantidad} x {i.nombre}</span>
                  <span className="font-num">{soles(i.precio * i.cantidad)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-line pt-3 text-lg font-extrabold">
              <span>Total</span>
              <span className="font-num">{soles(ventaHecha.total)}</span>
            </div>
            {ventaHecha.vuelto != null && (
              <p className="mt-1 text-right text-sm font-semibold text-muted">Vuelto: {soles(ventaHecha.vuelto)}</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
