import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { BellRing, Eye, EyeOff, Lock, Package, ShoppingCart, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const puntos = [
  { icon: Package, texto: 'Stock actualizado en tiempo real' },
  { icon: BellRing, texto: 'Alertas de reposición y vencimiento' },
  { icon: ShoppingCart, texto: 'Ventas rápidas en mostrador' },
]

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ usuario: '', clave: '' })
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [verClave, setVerClave] = useState(false)
  const [enviando, setEnviando] = useState(false)

  if (user) return <Navigate to="/" replace />

  const cambiar = (campo) => (e) => {
    setForm({ ...form, [campo]: e.target.value })
    setErrores({ ...errores, [campo]: undefined })
    setErrorGeneral('')
  }

  const enviar = async (e) => {
    e.preventDefault()
    const nuevos = {}
    if (!form.usuario.trim()) nuevos.usuario = 'Ingresa tu usuario'
    if (!form.clave) nuevos.clave = 'Ingresa tu contraseña'
    setErrores(nuevos)
    if (Object.keys(nuevos).length) return

    setEnviando(true)
    try {
      await login(form.usuario.trim(), form.clave)
      navigate('/')
    } catch (err) {
      setErrorGeneral(err.message)
      setErrores(err.errores ?? {})
    } finally {
      setEnviando(false)
    }
  }

  const input = 'w-full rounded-2xl bg-surface px-4 py-3 text-sm ring-1 outline-none transition-shadow focus:ring-2'

  return (
    <div className="grid min-h-screen bg-page lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden rounded-r-[48px] bg-brand-soft p-12 text-brand-deep lg:flex">
        {/* Cruz decorativa de fondo, muy tenue */}
        <svg viewBox="0 0 64 64" aria-hidden="true" className="pointer-events-none absolute -right-16 -bottom-20 size-96 text-surface opacity-20">
          <rect x="23.4" y="2" width="17.2" height="60" rx="8.6" fill="currentColor" />
          <rect x="3.7" y="23.85" width="56.6" height="16.3" rx="8.15" fill="currentColor" />
        </svg>

        <img src="/logo.png" alt="Nova Salud Botica" className="relative h-16 w-auto self-start" />

        <div className="relative">
          <h2 className="max-w-md text-4xl leading-tight font-extrabold tracking-tight">Inventario y ventas de la botica en un solo lugar.</h2>
          <p className="mt-4 max-w-md text-base font-medium">
            Controla tu stock, registra cada venta y recibe avisos antes de que algo se agote o venza.
          </p>
          <ul className="mt-8 space-y-4">
            {puntos.map(({ icon: Icon, texto }) => (
              <li key={texto} className="flex items-center gap-3 font-semibold">
                <Icon className="size-5" />
                {texto}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm font-medium">Sistema de gestión interno</p>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <form onSubmit={enviar} noValidate className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <img src="/logo.png" alt="Nova Salud Botica" className="h-12 w-auto" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight">Iniciar sesión</h1>
          <p className="mt-2 text-sm font-medium text-muted">Ingresa con la cuenta que te asignó el administrador.</p>

          {errorGeneral && (
            <p role="alert" className="mt-6 rounded-2xl bg-danger-tint px-4 py-3 text-sm font-semibold text-danger-deep">
              {errorGeneral}
            </p>
          )}

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="usuario" className="mb-2 block text-sm font-semibold">Usuario</label>
              <div className="relative">
                <User className="pointer-events-none absolute inset-y-0 left-4 my-auto size-4 text-muted" />
                <input
                  id="usuario"
                  value={form.usuario}
                  onChange={cambiar('usuario')}
                  autoComplete="username"
                  autoCapitalize="none"
                  className={`${input} pl-11 ${errores.usuario ? 'ring-danger' : 'ring-line focus:ring-brand'}`}
                />
              </div>
              {errores.usuario ? (
                <p className="mt-1.5 text-xs font-semibold text-danger">{errores.usuario}</p>
              ) : (
                <p className="mt-1.5 text-xs font-medium text-muted">Ejemplo: nayeli.caroline</p>
              )}
            </div>

            <div>
              <label htmlFor="clave" className="mb-2 block text-sm font-semibold">Contraseña</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute inset-y-0 left-4 my-auto size-4 text-muted" />
                <input
                  id="clave"
                  type={verClave ? 'text' : 'password'}
                  value={form.clave}
                  onChange={cambiar('clave')}
                  autoComplete="current-password"
                  className={`${input} pr-12 pl-11 ${errores.clave ? 'ring-danger' : 'ring-line focus:ring-brand'}`}
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
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="mt-8 w-full rounded-2xl bg-brand py-3.5 text-sm font-bold text-surface transition-colors hover:bg-brand-deep disabled:cursor-wait disabled:opacity-70"
          >
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </section>
    </div>
  )
}
