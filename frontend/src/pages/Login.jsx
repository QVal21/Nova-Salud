import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { BellRing, Eye, EyeOff, Package, Plus, ShoppingCart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const puntos = [
  { icon: Package, texto: 'Stock actualizado en tiempo real' },
  { icon: BellRing, texto: 'Alertas de reposición y vencimiento' },
  { icon: ShoppingCart, texto: 'Ventas rápidas en mostrador' },
]

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ usuario: '', clave: '', rol: 'vendedor' })
  const [errores, setErrores] = useState({})
  const [verClave, setVerClave] = useState(false)

  if (user) return <Navigate to="/" replace />

  const cambiar = (campo) => (e) => {
    setForm({ ...form, [campo]: e.target.value })
    setErrores({ ...errores, [campo]: undefined })
  }

  const enviar = (e) => {
    e.preventDefault()
    const nuevos = {}
    if (!form.usuario.trim()) nuevos.usuario = 'Ingresa tu usuario'
    if (form.clave.length < 6) nuevos.clave = 'La contraseña debe tener al menos 6 caracteres'
    setErrores(nuevos)
    if (Object.keys(nuevos).length) return

    // Maqueta: aquí irá la llamada a POST /api/auth/login
    login({ nombre: form.usuario.trim(), rol: form.rol })
    navigate('/')
  }

  const input =
    'w-full rounded-2xl bg-surface px-4 py-3 text-sm ring-1 outline-none transition-shadow focus:ring-2'

  return (
    <div className="grid min-h-screen bg-page lg:grid-cols-2">
      <section className="hidden flex-col justify-between rounded-r-[48px] bg-brand-soft p-12 text-brand-deep lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-surface text-brand">
            <Plus strokeWidth={3} className="size-6" />
          </span>
          <p className="text-lg font-extrabold">Nova Salud</p>
        </div>

        <div>
          <h2 className="max-w-md text-4xl leading-tight font-extrabold tracking-tight">
            Inventario y ventas de la botica en un solo lugar.
          </h2>
          <ul className="mt-8 space-y-4">
            {puntos.map(({ icon: Icon, texto }) => (
              <li key={texto} className="flex items-center gap-3 font-semibold">
                <Icon className="size-5" />
                {texto}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm font-medium">Sistema de gestión interno</p>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <form onSubmit={enviar} noValidate className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid size-10 place-items-center rounded-2xl bg-brand-soft text-brand-deep">
              <Plus strokeWidth={3} className="size-5" />
            </span>
            <p className="text-lg font-extrabold">Nova Salud</p>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight">Iniciar sesión</h1>
          <p className="mt-2 text-sm font-medium text-muted">Ingresa con la cuenta que te asignó el administrador.</p>

          <div className="mt-8 space-y-5">
            <div>
              <label htmlFor="usuario" className="mb-2 block text-sm font-semibold">Usuario</label>
              <input
                id="usuario"
                value={form.usuario}
                onChange={cambiar('usuario')}
                placeholder="nayeli.quispe"
                autoComplete="username"
                className={`${input} ${errores.usuario ? 'ring-danger' : 'ring-line focus:ring-brand'}`}
              />
              {errores.usuario && <p className="mt-1.5 text-xs font-semibold text-danger">{errores.usuario}</p>}
            </div>

            <div>
              <label htmlFor="clave" className="mb-2 block text-sm font-semibold">Contraseña</label>
              <div className="relative">
                <input
                  id="clave"
                  type={verClave ? 'text' : 'password'}
                  value={form.clave}
                  onChange={cambiar('clave')}
                  autoComplete="current-password"
                  className={`${input} pr-12 ${errores.clave ? 'ring-danger' : 'ring-line focus:ring-brand'}`}
                />
                <button
                  type="button"
                  onClick={() => setVerClave(!verClave)}
                  className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted hover:text-ink"
                  aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {verClave ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errores.clave && <p className="mt-1.5 text-xs font-semibold text-danger">{errores.clave}</p>}
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">Ingresar como</p>
              <div className="grid grid-cols-2 gap-1 rounded-2xl bg-surface p-1 ring-1 ring-line">
                {['vendedor', 'admin'].map((rol) => (
                  <button
                    key={rol}
                    type="button"
                    onClick={() => setForm({ ...form, rol })}
                    className={`rounded-xl py-2.5 text-sm font-semibold capitalize transition-colors ${
                      form.rol === rol ? 'bg-brand-tint text-brand-deep' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {rol === 'admin' ? 'Administrador' : 'Vendedor'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mt-8 w-full rounded-2xl bg-brand py-3.5 text-sm font-bold text-surface transition-colors hover:bg-brand-deep"
          >
            Ingresar
          </button>
        </form>
      </section>
    </div>
  )
}
