import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useData } from '../context/DataContext'
import { EmptyRow, Field, Modal, PageHeader, Panel, SearchBox, btn, inputCls, td, th } from '../components/ui'
import { fechaCorta, fechaHora, normalizar, soles } from '../utils/format'
import { DetalleVenta } from './Ventas'

export default function Clientes() {
  const { clientes, ventas, guardarCliente } = useData()
  const [q, setQ] = useState('')
  const [nuevo, setNuevo] = useState(false)
  const [historial, setHistorial] = useState(null)
  const [detalle, setDetalle] = useState(null)

  const comprasDe = (dni) => ventas.filter((v) => v.cliente?.dni === dni)
  const lista = clientes.filter((c) => normalizar(`${c.nombre} ${c.dni} ${c.telefono}`).includes(normalizar(q)))

  return (
    <div>
      <PageHeader description="Clientes registrados por DNI. Al vender, basta con escribir el DNI para asociar la compra y consultar su historial.">
        <button onClick={() => setNuevo(true)} className={btn.primary}>
          <Plus className="size-4" strokeWidth={3} /> Nuevo cliente
        </button>
      </PageHeader>

      <Panel>
        <SearchBox value={q} onChange={setQ} placeholder="Buscar por nombre, DNI o teléfono" className="lg:w-96" />
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-line">
              <tr>
                <th className={th}>DNI</th>
                <th className={th}>Nombre</th>
                <th className={th}>Teléfono</th>
                <th className={`${th} text-right`}>Compras</th>
                <th className={`${th} text-right`}>Total comprado</th>
                <th className={th}>Última compra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {lista.map((c) => {
                const compras = comprasDe(c.dni)
                return (
                  <tr key={c.id} onClick={() => setHistorial(c)} className="cursor-pointer transition-colors hover:bg-brand-tint/50">
                    <td className={`${td} font-num`}>{c.dni}</td>
                    <td className={`${td} font-bold`}>{c.nombre}</td>
                    <td className={`${td} font-num text-muted`}>{c.telefono || '—'}</td>
                    <td className={`${td} text-right font-num`}>{compras.length}</td>
                    <td className={`${td} text-right font-num font-semibold`}>{soles(compras.reduce((s, v) => s + v.total, 0))}</td>
                    <td className={`${td} text-muted`}>{compras[0] ? fechaCorta(compras[0].fecha) : 'Sin compras'}</td>
                  </tr>
                )
              })}
              {!lista.length && <EmptyRow cols={6} text="No hay clientes que coincidan." />}
            </tbody>
          </table>
        </div>
      </Panel>

      {nuevo && (
        <ClienteForm
          dnisExistentes={clientes.map((c) => c.dni)}
          onClose={() => setNuevo(false)}
          onSave={async (d) => {
            await guardarCliente(d)
            setNuevo(false)
          }}
        />
      )}

      <Modal open={!!historial} size="lg" title={historial?.nombre ?? ''} onClose={() => setHistorial(null)}>
        {historial && (
          <div className="text-sm">
            <p className="font-medium text-muted">
              DNI {historial.dni}{historial.telefono && ` · ${historial.telefono}`}{historial.email && ` · ${historial.email}`}
            </p>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {comprasDe(historial.dni).map((v) => (
                <li key={v.id}>
                  <button onClick={() => setDetalle(v)} className="flex w-full justify-between gap-4 py-3 text-left hover:text-brand">
                    <span>
                      <span className="font-num font-semibold">{v.comprobante}</span>
                      <span className="text-muted"> · {fechaHora(v.fecha)} · {v.items.length} productos</span>
                    </span>
                    <span className="font-num font-semibold">{soles(v.total)}</span>
                  </button>
                </li>
              ))}
              {!comprasDe(historial.dni).length && <li className="py-6 text-center text-muted">Este cliente aún no tiene compras.</li>}
            </ul>
          </div>
        )}
      </Modal>

      <DetalleVenta venta={detalle} onClose={() => setDetalle(null)} />
    </div>
  )
}

function ClienteForm({ dnisExistentes, onClose, onSave }) {
  const [f, setF] = useState({ dni: '', nombre: '', telefono: '', email: '' })
  const [err, setErr] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const set = (k, soloNumeros) => (e) => {
    setF({ ...f, [k]: soloNumeros ? e.target.value.replace(/\D/g, '') : e.target.value })
    setErr({ ...err, [k]: undefined })
  }

  const guardar = async (e) => {
    e.preventDefault()
    const n = {}
    if (!/^\d{8}$/.test(f.dni)) n.dni = 'El DNI debe tener 8 dígitos'
    else if (dnisExistentes.includes(f.dni)) n.dni = 'Ya existe un cliente con este DNI'
    if (!f.nombre.trim()) n.nombre = 'Ingresa el nombre completo'
    if (f.telefono && !/^9\d{8}$/.test(f.telefono)) n.telefono = 'El celular debe tener 9 dígitos y empezar con 9'
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) n.email = 'Correo no válido'
    setErr(n)
    if (Object.keys(n).length) return
    try {
      await onSave({ ...f, nombre: f.nombre.trim() })
    } catch (error) {
      setErr(error.errores ?? {})
      setErrorGeneral(error.message)
    }
  }

  return (
    <Modal
      open
      title="Nuevo cliente"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className={btn.secondary}>Cancelar</button>
          <button onClick={guardar} className={btn.primary}>Guardar</button>
        </>
      }
    >
      {errorGeneral && <p role="alert" className="mb-4 rounded-2xl bg-danger-tint px-4 py-3 text-sm font-semibold text-danger-deep">{errorGeneral}</p>}
      <form onSubmit={guardar} noValidate className="space-y-4">
        <Field label="DNI" htmlFor="dni" error={err.dni}>
          <input id="dni" inputMode="numeric" maxLength={8} value={f.dni} onChange={set('dni', true)} className={inputCls(err.dni)} />
        </Field>
        <Field label="Nombre completo" htmlFor="nombre" error={err.nombre}>
          <input id="nombre" value={f.nombre} onChange={set('nombre')} className={inputCls(err.nombre)} />
        </Field>
        <Field label="Celular (opcional)" htmlFor="telefono" error={err.telefono}>
          <input id="telefono" inputMode="numeric" maxLength={9} value={f.telefono} onChange={set('telefono', true)} className={inputCls(err.telefono)} />
        </Field>
        <Field label="Correo (opcional)" htmlFor="email" error={err.email}>
          <input id="email" type="email" value={f.email} onChange={set('email')} className={inputCls(err.email)} />
        </Field>
      </form>
    </Modal>
  )
}
