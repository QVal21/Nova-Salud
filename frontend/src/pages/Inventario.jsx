import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { useData, DIAS_ALERTA_VENCE } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { Badge, Chips, EmptyRow, Field, Modal, PageHeader, Panel, SearchBox, btn, inputCls, td, th } from '../components/ui'
import { diasHasta, fechaCorta, normalizar, soles } from '../utils/format'

export const estadoProducto = (p) => {
  if (p.stock <= 0) return { key: 'agotado', label: 'Agotado', variant: 'danger' }
  if (diasHasta(p.vence) < 0) return { key: 'vence', label: 'Vencido', variant: 'danger' }
  if (p.stock <= p.minimo) return { key: 'bajo', label: 'Stock bajo', variant: 'danger' }
  if (diasHasta(p.vence) <= DIAS_ALERTA_VENCE) return { key: 'vence', label: 'Por vencer', variant: 'warning' }
  return { key: 'ok', label: 'Disponible', variant: 'success' }
}

export default function Inventario() {
  const { productos, proveedores, guardarProducto } = useData()
  const esAdmin = useAuth().user?.rol === 'admin' // solo el admin crea o edita productos
  const [q, setQ] = useState('')
  const [categoria, setCategoria] = useState('Todas')
  const [estado, setEstado] = useState('todos')
  const [editando, setEditando] = useState(null)

  const categorias = [...new Set(productos.map((p) => p.categoria))]
  const contar = (k) => productos.filter((p) => estadoProducto(p).key === k).length

  const lista = productos.filter(
    (p) =>
      (categoria === 'Todas' || p.categoria === categoria) &&
      (estado === 'todos' || estadoProducto(p).key === estado) &&
      normalizar(`${p.nombre} ${p.codigo} ${p.laboratorio} ${p.lote}`).includes(normalizar(q)),
  )

  return (
    <div>
      <PageHeader description="Catálogo de productos con su stock, lote y fecha de vencimiento. El stock solo cambia con ventas o movimientos registrados.">
        {esAdmin && (
          <button onClick={() => setEditando({})} className={btn.primary}>
            <Plus className="size-4" strokeWidth={3} /> Nuevo producto
          </button>
        )}
      </PageHeader>

      <Panel>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <SearchBox value={q} onChange={setQ} placeholder="Buscar por nombre, código, laboratorio o lote" className="lg:w-96" />
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={`${inputCls(false)} lg:w-56`} aria-label="Categoría">
            <option>Todas</option>
            {categorias.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="mt-4">
          <Chips
            value={estado}
            onChange={setEstado}
            options={[
              { value: 'todos', label: 'Todos', count: productos.length },
              { value: 'bajo', label: 'Stock bajo', count: contar('bajo') },
              { value: 'vence', label: 'Por vencer', count: contar('vence') },
              { value: 'agotado', label: 'Agotados', count: contar('agotado') },
            ]}
          />
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="border-b border-line">
              <tr>
                <th className={th}>Código</th>
                <th className={th}>Producto</th>
                <th className={th}>Categoría</th>
                <th className={`${th} text-right`}>Stock</th>
                <th className={`${th} text-right`}>Precio</th>
                <th className={th}>Lote / vence</th>
                <th className={th}>Estado</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {lista.map((p) => {
                const e = estadoProducto(p)
                return (
                  <tr key={p.id}>
                    <td className={`${td} font-num text-muted`}>{p.codigo}</td>
                    <td className={td}>
                      <p className="font-bold">{p.nombre}</p>
                      <p className="text-xs font-medium text-muted">{p.presentacion} · {p.laboratorio}{p.receta ? ' · Con receta' : ''}</p>
                    </td>
                    <td className={td}>{p.categoria}</td>
                    <td className={`${td} text-right font-num`}>
                      <span className="font-semibold">{p.stock}</span>
                      <span className="text-muted"> / {p.minimo} mín.</span>
                    </td>
                    <td className={`${td} text-right font-num font-semibold`}>{soles(p.precio)}</td>
                    <td className={td}>
                      <p className="font-num">{p.lote}</p>
                      <p className="text-xs font-medium text-muted">{fechaCorta(p.vence)}</p>
                    </td>
                    <td className={td}><Badge variant={e.variant}>{e.label}</Badge></td>
                    <td className={`${td} text-right`}>
                      {esAdmin && (
                        <button onClick={() => setEditando(p)} className={btn.small}>
                          <Pencil className="size-3.5" /> Editar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {!lista.length && <EmptyRow cols={8} text="No hay productos que coincidan con los filtros." />}
            </tbody>
          </table>
        </div>
      </Panel>

      {editando && (
        <ProductoForm
          producto={editando}
          categorias={categorias}
          proveedores={proveedores}
          onClose={() => setEditando(null)}
          onSave={async (datos) => {
            await guardarProducto(datos)
            setEditando(null)
          }}
        />
      )}
    </div>
  )
}

function ProductoForm({ producto, categorias, proveedores, onClose, onSave }) {
  const nuevo = !producto.id
  const [f, setF] = useState({
    nombre: '', presentacion: '', categoria: '', laboratorio: '', precio: '', stock: '0', minimo: '10',
    lote: '', vence: '', receta: false, proveedorId: proveedores[0]?.id ?? '',
    ...producto,
  })
  const [err, setErr] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setF({ ...f, [k]: v })
    setErr({ ...err, [k]: undefined })
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (enviando) return
    const n = {}
    if (!f.nombre.trim()) n.nombre = 'Ingresa el nombre'
    if (!f.presentacion.trim()) n.presentacion = 'Ingresa la presentación'
    if (!f.categoria.trim()) n.categoria = 'Ingresa la categoría'
    if (!(Number(f.precio) > 0)) n.precio = 'El precio debe ser mayor a 0'
    if (nuevo && (!Number.isInteger(Number(f.stock)) || Number(f.stock) < 0)) n.stock = 'Stock inválido'
    if (!Number.isInteger(Number(f.minimo)) || Number(f.minimo) < 0) n.minimo = 'Mínimo inválido'
    if (!f.lote.trim()) n.lote = 'Ingresa el lote'
    if (!f.vence) n.vence = 'Ingresa la fecha de vencimiento'
    setErr(n)
    if (Object.keys(n).length) return
    setEnviando(true)
    setErrorGeneral('')
    try {
      await onSave({
        ...f,
        nombre: f.nombre.trim(),
        precio: Number(f.precio),
        stock: Number(f.stock),
        minimo: Number(f.minimo),
      })
    } catch (error) {
      setErr(error.errores ?? {})
      setErrorGeneral(error.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal
      open
      size="lg"
      title={nuevo ? 'Nuevo producto' : `Editar ${producto.nombre}`}
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
      <form onSubmit={guardar} noValidate className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Nombre" htmlFor="nombre" error={err.nombre}>
            <input id="nombre" value={f.nombre} onChange={set('nombre')} placeholder="Paracetamol 500 mg" className={inputCls(err.nombre)} />
          </Field>
        </div>
        <Field label="Presentación" htmlFor="presentacion" error={err.presentacion}>
          <input id="presentacion" value={f.presentacion} onChange={set('presentacion')} placeholder="Tableta x 100" className={inputCls(err.presentacion)} />
        </Field>
        <Field label="Categoría" htmlFor="categoria" error={err.categoria}>
          <input id="categoria" list="lista-categorias" value={f.categoria} onChange={set('categoria')} placeholder="Analgésicos" className={inputCls(err.categoria)} />
          <datalist id="lista-categorias">{categorias.map((c) => <option key={c} value={c} />)}</datalist>
        </Field>
        <Field label="Laboratorio" htmlFor="laboratorio">
          <input id="laboratorio" value={f.laboratorio} onChange={set('laboratorio')} placeholder="Genfar" className={inputCls(false)} />
        </Field>
        <Field label="Proveedor" htmlFor="proveedor">
          <select id="proveedor" value={f.proveedorId} onChange={set('proveedorId')} className={inputCls(false)}>
            {proveedores.map((p) => <option key={p.id} value={p.id}>{p.razonSocial}</option>)}
          </select>
        </Field>
        <Field label="Precio de venta (S/)" htmlFor="precio" error={err.precio}>
          <input id="precio" type="number" min="0" step="0.1" value={f.precio} onChange={set('precio')} className={inputCls(err.precio)} />
        </Field>
        <Field label="Stock mínimo" htmlFor="minimo" error={err.minimo} hint="Al llegar a este número se genera una alerta.">
          <input id="minimo" type="number" min="0" value={f.minimo} onChange={set('minimo')} className={inputCls(err.minimo)} />
        </Field>
        <Field
          label="Stock inicial"
          htmlFor="stock"
          error={err.stock}
          hint={nuevo ? undefined : 'Para cambiar el stock registra un movimiento.'}
        >
          <input id="stock" type="number" min="0" value={f.stock} onChange={set('stock')} disabled={!nuevo} className={`${inputCls(err.stock)} disabled:bg-page disabled:text-muted`} />
        </Field>
        <Field label="Lote" htmlFor="lote" error={err.lote}>
          <input id="lote" value={f.lote} onChange={set('lote')} placeholder="L-2201" className={inputCls(err.lote)} />
        </Field>
        <Field label="Fecha de vencimiento" htmlFor="vence" error={err.vence}>
          <input id="vence" type="date" value={f.vence} onChange={set('vence')} className={inputCls(err.vence)} />
        </Field>
        <label className="flex items-center gap-3 self-end pb-3 text-sm font-semibold">
          <input type="checkbox" checked={f.receta} onChange={set('receta')} className="size-4 accent-brand" />
          Requiere receta médica
        </label>
      </form>
    </Modal>
  )
}
