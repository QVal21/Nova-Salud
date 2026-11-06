import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { Badge, Field, Modal, PageHeader, Panel, Segmented, btn, inputCls, td, th } from '../components/ui'

export default function Usuarios() {
  const { usuarios, guardarUsuario, alternarUsuario, ejecutar } = useData()
  const yo = useAuth().user
  const [nuevo, setNuevo] = useState(false)

  return (
    <div>
      <PageHeader description="Cuentas del personal. El administrador gestiona inventario, proveedores y reportes; el vendedor atiende ventas y consulta stock.">
        <button onClick={() => setNuevo(true)} className={btn.primary}>
          <Plus className="size-4" strokeWidth={3} /> Nuevo usuario
        </button>
      </PageHeader>

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-line">
              <tr>
                <th className={th}>Nombre</th>
                <th className={th}>Usuario</th>
                <th className={th}>Rol</th>
                <th className={th}>Estado</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td className={`${td} font-bold`}>{u.nombre}</td>
                  <td className={`${td} font-num text-muted`}>{u.usuario}</td>
                  <td className={td}>{u.rol === 'admin' ? <Badge variant="info">Administrador</Badge> : <Badge>Vendedor</Badge>}</td>
                  <td className={td}>{u.activo ? <Badge variant="success">Activo</Badge> : <Badge variant="danger">Inactivo</Badge>}</td>
                  <td className={`${td} text-right`}>
                    {u.id !== yo?.id && (
                      <button onClick={() => ejecutar(() => alternarUsuario(u))} className={btn.small}>
                        {u.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {nuevo && (
        <UsuarioForm
          existentes={usuarios.map((u) => u.usuario)}
          onClose={() => setNuevo(false)}
          onSave={async (d) => {
            await guardarUsuario(d)
            setNuevo(false)
          }}
        />
      )}
    </div>
  )
}

function UsuarioForm({ existentes, onClose, onSave }) {
  const [f, setF] = useState({ nombre: '', usuario: '', rol: 'vendedor', clave: '' })
  const [err, setErr] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const set = (k) => (e) => {
    setF({ ...f, [k]: e.target.value })
    setErr({ ...err, [k]: undefined })
  }

  const guardar = async (e) => {
    e.preventDefault()
    const n = {}
    if (!f.nombre.trim()) n.nombre = 'Ingresa el nombre'
    if (!/^[a-z0-9._]{4,}$/.test(f.usuario)) n.usuario = 'Mínimo 4 caracteres: minúsculas, números, punto o guion bajo'
    else if (existentes.includes(f.usuario)) n.usuario = 'Ese usuario ya existe'
    if (f.clave.length < 6) n.clave = 'La contraseña debe tener al menos 6 caracteres'
    setErr(n)
    if (Object.keys(n).length) return
    try {
      // El backend guarda la contraseña cifrada con bcrypt
      await onSave({ nombre: f.nombre.trim(), usuario: f.usuario, rol: f.rol, clave: f.clave })
    } catch (error) {
      setErr(error.errores ?? {})
      setErrorGeneral(error.message)
    }
  }

  return (
    <Modal
      open
      title="Nuevo usuario"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className={btn.secondary}>Cancelar</button>
          <button onClick={guardar} className={btn.primary}>Crear usuario</button>
        </>
      }
    >
      {errorGeneral && <p role="alert" className="mb-4 rounded-2xl bg-danger-tint px-4 py-3 text-sm font-semibold text-danger-deep">{errorGeneral}</p>}
      <form onSubmit={guardar} noValidate className="space-y-4">
        <Field label="Nombre completo" htmlFor="nombre" error={err.nombre}>
          <input id="nombre" value={f.nombre} onChange={set('nombre')} className={inputCls(err.nombre)} />
        </Field>
        <Field label="Usuario" htmlFor="usuario" error={err.usuario}>
          <input id="usuario" value={f.usuario} onChange={set('usuario')} placeholder="ana.torres" autoComplete="off" className={inputCls(err.usuario)} />
        </Field>
        <div>
          <p className="mb-2 text-sm font-semibold">Rol</p>
          <Segmented
            value={f.rol}
            onChange={(rol) => setF({ ...f, rol })}
            options={[
              { value: 'vendedor', label: 'Vendedor' },
              { value: 'admin', label: 'Administrador' },
            ]}
          />
        </div>
        <Field label="Contraseña temporal" htmlFor="clave" error={err.clave}>
          <input id="clave" type="password" value={f.clave} onChange={set('clave')} autoComplete="new-password" className={inputCls(err.clave)} />
        </Field>
      </form>
    </Modal>
  )
}
