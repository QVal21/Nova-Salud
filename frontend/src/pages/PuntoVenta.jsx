import { useRef, useState } from 'react'
import { Banknote, CheckCircle2, CreditCard, Minus, Plus, Printer, ShoppingCart, Smartphone, Trash2 } from 'lucide-react'
import { useData } from '../context/DataContext'
import { Badge, Dropdown, Field, Modal, SearchBox, Segmented, btn, inputCls } from '../components/ui'
import Boleta from '../components/Boleta'
import { normalizar, soles } from '../utils/format'

const metodos = [
  { value: 'efectivo', label: 'Efectivo', icon: Banknote },
  { value: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
  { value: 'yape', label: 'Yape / Plin', icon: Smartphone },
]

export default function PuntoVenta() {
  const { productos, clientes, registrarVenta, guardarCliente } = useData()
  const busquedaRef = useRef(null)
  const ventaRef = useRef(null)
  const inicioRef = useRef(null) // momento en que se agregó el primer producto: mide el tiempo de atención
  const [enviando, setEnviando] = useState(false)

  const [q, setQ] = useState('')
  const [categoria, setCategoria] = useState('Todas')
  const [carrito, setCarrito] = useState([])
  const [tipo, setTipo] = useState('boleta')
  const [documento, setDocumento] = useState('')
  const [metodo, setMetodo] = useState('efectivo')
  const [recibido, setRecibido] = useState('')
  const [error, setError] = useState('')
  const [ventaHecha, setVentaHecha] = useState(null)
  const [registrandoCliente, setRegistrandoCliente] = useState(false)

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
  const dniNoRegistrado = tipo === 'boleta' && /^\d{8}$/.test(documento) && !cliente
  const vuelto = metodo === 'efectivo' && recibido !== '' ? Number(recibido) - total : null
  const necesitaReceta = carrito.some((i) => i.receta)

  const agregar = (p) => {
    if (p.stock <= 0) return
    if (!inicioRef.current) inicioRef.current = Date.now()
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

  const cobrar = async () => {
    if (enviando) return
    if (!carrito.length) return setError('Agrega al menos un producto.')
    if (tipo === 'factura' && !/^\d{11}$/.test(documento)) return setError('Para factura ingresa un RUC de 11 dígitos.')
    if (documento && tipo === 'boleta' && !/^\d{8}$/.test(documento)) return setError('El DNI debe tener 8 dígitos.')
    if (metodo === 'efectivo' && recibido !== '' && Number(recibido) < total) return setError('El monto recibido no cubre el total.')

    setEnviando(true)
    try {
      // El backend toma precios y descuenta stock; aquí solo se envían productos y cantidades
      const venta = await registrarVenta({
        items: carrito.map((i) => ({ productoId: i.id, cantidad: i.cantidad })),
        tipo,
        metodo,
        documento,
        duracionSegundos: inicioRef.current ? Math.round((Date.now() - inicioRef.current) / 1000) : undefined,
      })
      setVentaHecha({ ...venta, vuelto })
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(false)
    }
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
    inicioRef.current = null
    setTimeout(() => busquedaRef.current?.focus(), 0)
  }

  return (
    <div className={`grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px] ${carrito.length ? 'pb-20 xl:pb-0' : ''}`}>
      {/* Catálogo */}
      <section className="rounded-3xl bg-surface p-4 ring-1 ring-line sm:rounded-[28px] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchBox
            className="min-w-0 flex-1"
            inputRef={busquedaRef}
            autoFocus
            value={q}
            onChange={setQ}
            onKeyDown={alPresionar}
            placeholder="Busca por nombre, código o laboratorio y presiona Enter"
          />
          <Dropdown
            className="sm:w-56 sm:shrink-0"
            defaultLabel="Categorías"
            ariaLabel="Categoría"
            options={categorias.map((c) => ({ value: c, label: c }))}
            value={categoria}
            onChange={setCategoria}
          />
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
                  className="flex w-full items-center gap-2.5 rounded-2xl px-1 py-3 text-left sm:gap-4 sm:px-2 transition-colors hover:bg-brand-tint/60 disabled:cursor-not-allowed disabled:hover:bg-transparent"
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
                  <span className="min-w-16 text-right font-num text-sm font-semibold sm:w-20 sm:text-base">{soles(p.precio)}</span>
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
      <aside ref={ventaRef} className="scroll-mt-4 rounded-3xl bg-surface p-4 ring-1 ring-line sm:rounded-[28px] sm:p-6 xl:sticky xl:top-6">
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
          {dniNoRegistrado && (
            <div className="-mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
              <p className="text-xs font-bold text-muted">DNI no registrado</p>
              <button type="button" onClick={() => setRegistrandoCliente(true)} className={btn.small}>
                Registrar cliente
              </button>
            </div>
          )}
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
              <span className="w-16 text-right font-num text-sm font-semibold sm:w-20">{soles(i.precio * i.cantidad)}</span>
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

        <button onClick={cobrar} disabled={enviando} className={`${btn.primary} mt-5 w-full py-4 text-base disabled:cursor-wait disabled:opacity-70`}>
          {enviando ? 'Registrando…' : `Cobrar ${soles(total)}`}
        </button>
      </aside>

      {/* Registrar cliente nuevo sin salir de la venta: el carrito no se toca */}
      {registrandoCliente && (
        <ClienteRapidoForm
          dni={documento}
          onClose={() => setRegistrandoCliente(false)}
          onSave={async (d) => {
            await guardarCliente(d)
            setRegistrandoCliente(false)
          }}
        />
      )}

      {/* Solo en celular/tablet: acceso rápido a la venta actual, que queda debajo del catálogo */}
      {carrito.length > 0 && !ventaHecha && (
        <button
          type="button"
          onClick={() => ventaRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="fixed inset-x-4 bottom-4 z-30 flex items-center justify-between gap-3 rounded-2xl bg-brand px-5 py-3.5 text-surface shadow-lg transition-colors hover:bg-brand-deep xl:hidden"
        >
          <span className="flex items-center gap-2 text-sm font-bold">
            <ShoppingCart className="size-4.5" />
            Ver venta · {carrito.reduce((s, i) => s + i.cantidad, 0)} {carrito.reduce((s, i) => s + i.cantidad, 0) === 1 ? 'producto' : 'productos'}
          </span>
          <span className="font-num text-base font-semibold">{soles(total)}</span>
        </button>
      )}

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
        {ventaHecha && <Boleta venta={ventaHecha} vuelto={ventaHecha.vuelto} />}
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

function ClienteRapidoForm({ dni, onClose, onSave }) {
  const [f, setF] = useState({ nombre: '', telefono: '', email: '', consentimiento: false })
  const [err, setErr] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)

  const set = (k, soloNumeros) => (e) => {
    setF({ ...f, [k]: soloNumeros ? e.target.value.replace(/\D/g, '') : e.target.value })
    setErr({ ...err, [k]: undefined })
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (enviando) return
    const n = {}
    if (!f.nombre.trim()) n.nombre = 'Ingresa el nombre completo'
    if (f.telefono && !/^9\d{8}$/.test(f.telefono)) n.telefono = 'El celular debe tener 9 dígitos y empezar con 9'
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) n.email = 'Correo no válido'
    if (!f.consentimiento) n.consentimiento = 'El cliente debe autorizar el registro de sus datos'
    setErr(n)
    if (Object.keys(n).length) return
    setEnviando(true)
    setErrorGeneral('')
    try {
      await onSave({ dni, nombre: f.nombre.trim(), telefono: f.telefono, email: f.email.trim(), consentimiento: true })
    } catch (error) {
      setErr(error.errores ?? {})
      setErrorGeneral(error.message)
      setEnviando(false)
    }
  }

  return (
    <Modal
      open
      title="Registrar cliente"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className={btn.secondary}>Cancelar</button>
          <button onClick={guardar} disabled={enviando} className={`${btn.primary} disabled:opacity-70`}>
            {enviando ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      {errorGeneral && <p role="alert" className="mb-4 rounded-2xl bg-danger-tint px-4 py-3 text-sm font-semibold text-danger-deep">{errorGeneral}</p>}
      <form onSubmit={guardar} noValidate className="space-y-4">
        <Field label="DNI" htmlFor="cr-dni" error={err.dni}>
          <input id="cr-dni" value={dni} readOnly className={`${inputCls(err.dni)} bg-page text-muted`} />
        </Field>
        <Field label="Nombre completo" htmlFor="cr-nombre" error={err.nombre}>
          <input id="cr-nombre" autoFocus value={f.nombre} onChange={set('nombre')} className={inputCls(err.nombre)} />
        </Field>
        <Field label="Celular (opcional)" htmlFor="cr-telefono" error={err.telefono}>
          <input id="cr-telefono" inputMode="numeric" maxLength={9} value={f.telefono} onChange={set('telefono', true)} className={inputCls(err.telefono)} />
        </Field>
        <Field label="Correo (opcional)" htmlFor="cr-email" error={err.email}>
          <input id="cr-email" type="email" value={f.email} onChange={set('email')} className={inputCls(err.email)} />
        </Field>
        <div>
          <label className="flex items-start gap-3 text-sm font-medium">
            <input
              type="checkbox"
              checked={f.consentimiento}
              onChange={(e) => {
                setF({ ...f, consentimiento: e.target.checked })
                setErr({ ...err, consentimiento: undefined })
              }}
              className="mt-0.5 size-4 shrink-0 accent-brand"
            />
            El cliente autoriza el registro de sus datos personales (Ley N.° 29733)
          </label>
          {err.consentimiento && <p className="mt-1.5 text-xs font-semibold text-danger">{err.consentimiento}</p>}
        </div>
      </form>
    </Modal>
  )
}
