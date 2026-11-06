import { useState } from 'react'
import { PackageCheck, Plus } from 'lucide-react'
import { useData } from '../context/DataContext'
import { Badge, EmptyRow, Field, Modal, PageHeader, Panel, btn, inputCls, td, th } from '../components/ui'
import { fechaCorta } from '../utils/format'

export default function Proveedores() {
  const { proveedores, pedidos, guardarProveedor, recibirPedido, ejecutar } = useData()
  const [nuevo, setNuevo] = useState(false)


  return (
    <div className="space-y-6">
      <PageHeader description="Pedidos de reposición generados desde las alertas y directorio de proveedores. Al marcar un pedido como recibido, el stock se actualiza solo.">
        <button onClick={() => setNuevo(true)} className={btn.primary}>
          <Plus className="size-4" strokeWidth={3} /> Nuevo proveedor
        </button>
      </PageHeader>

      <Panel>
        <h2 className="text-lg font-extrabold">Pedidos de reposición</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-line">
              <tr>
                <th className={th}>Fecha</th>
                <th className={th}>Producto</th>
                <th className={th}>Proveedor</th>
                <th className={`${th} text-right`}>Cantidad</th>
                <th className={th}>Estado</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pedidos.map((p) => (
                <tr key={p.id}>
                  <td className={`${td} text-muted`}>{fechaCorta(p.fecha)}</td>
                  <td className={`${td} font-bold`}>{p.productoNombre}</td>
                  <td className={`${td} text-muted`}>{p.proveedorNombre}</td>
                  <td className={`${td} text-right font-num font-semibold`}>{p.cantidad} u.</td>
                  <td className={td}>
                    {p.estado === 'pendiente' ? <Badge variant="warning">Pendiente</Badge> : <Badge variant="success">Recibido</Badge>}
                  </td>
                  <td className={`${td} text-right`}>
                    {p.estado === 'pendiente' && (
                      <button onClick={() => ejecutar(() => recibirPedido(p))} className={btn.small}>
                        <PackageCheck className="size-3.5" /> Marcar recibido
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!pedidos.length && <EmptyRow cols={6} text="No hay pedidos. Genéralos desde la sección Alertas." />}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel>
        <h2 className="text-lg font-extrabold">Proveedores</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-line">
              <tr>
                <th className={th}>RUC</th>
                <th className={th}>Razón social</th>
                <th className={th}>Contacto</th>
                <th className={th}>Teléfono</th>
                <th className={th}>Correo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {proveedores.map((p) => (
                <tr key={p.id}>
                  <td className={`${td} font-num`}>{p.ruc}</td>
                  <td className={`${td} font-bold`}>{p.razonSocial}</td>
                  <td className={td}>{p.contacto}</td>
                  <td className={`${td} font-num text-muted`}>{p.telefono}</td>
                  <td className={`${td} text-muted`}>{p.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {nuevo && (
        <ProveedorForm
          onClose={() => setNuevo(false)}
          onSave={async (d) => {
            await guardarProveedor(d)
            setNuevo(false)
          }}
        />
      )}
    </div>
  )
}

function ProveedorForm({ onClose, onSave }) {
  const [f, setF] = useState({ ruc: '', razonSocial: '', contacto: '', telefono: '', email: '' })
  const [err, setErr] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const set = (k, soloNumeros) => (e) => {
    setF({ ...f, [k]: soloNumeros ? e.target.value.replace(/\D/g, '') : e.target.value })
    setErr({ ...err, [k]: undefined })
  }

  const guardar = async (e) => {
    e.preventDefault()
    const n = {}
    if (!/^(10|20)\d{9}$/.test(f.ruc)) n.ruc = 'El RUC debe tener 11 dígitos y empezar con 10 o 20'
    if (!f.razonSocial.trim()) n.razonSocial = 'Ingresa la razón social'
    if (f.telefono && !/^\d{9}$/.test(f.telefono)) n.telefono = 'El teléfono debe tener 9 dígitos'
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) n.email = 'Correo no válido'
    setErr(n)
    if (Object.keys(n).length) return
    try {
      await onSave(f)
    } catch (error) {
      setErr(error.errores ?? {})
      setErrorGeneral(error.message)
    }
  }

  return (
    <Modal
      open
      title="Nuevo proveedor"
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
        <Field label="RUC" htmlFor="ruc" error={err.ruc}>
          <input id="ruc" inputMode="numeric" maxLength={11} value={f.ruc} onChange={set('ruc', true)} className={inputCls(err.ruc)} />
        </Field>
        <Field label="Razón social" htmlFor="razon" error={err.razonSocial}>
          <input id="razon" value={f.razonSocial} onChange={set('razonSocial')} className={inputCls(err.razonSocial)} />
        </Field>
        <Field label="Persona de contacto" htmlFor="contacto">
          <input id="contacto" value={f.contacto} onChange={set('contacto')} className={inputCls(false)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Teléfono" htmlFor="telefono" error={err.telefono}>
            <input id="telefono" inputMode="numeric" maxLength={9} value={f.telefono} onChange={set('telefono', true)} className={inputCls(err.telefono)} />
          </Field>
          <Field label="Correo" htmlFor="email" error={err.email}>
            <input id="email" type="email" value={f.email} onChange={set('email')} className={inputCls(err.email)} />
          </Field>
        </div>
      </form>
    </Modal>
  )
}
