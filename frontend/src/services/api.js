// Cliente HTTP de la API. Agrega el token y convierte los errores del backend en ApiError.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const KEY = 'nova-salud-sesion'

export class ApiError extends Error {
  constructor(status, mensaje, errores) {
    super(mensaje)
    this.status = status
    this.errores = errores || {}
  }
}

export function leerSesion() {
  try {
    return JSON.parse(localStorage.getItem(KEY))
  } catch {
    return null
  }
}

export function guardarSesion(sesion) {
  try {
    if (sesion) localStorage.setItem(KEY, JSON.stringify(sesion))
    else localStorage.removeItem(KEY)
  } catch {}
}

let alExpirar = () => {}
export const onSesionExpirada = (fn) => {
  alExpirar = fn
}

async function request(method, path, body) {
  const token = leerSesion()?.token
  let res
  try {
    res = await fetch(BASE + path, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Revisa que la API esté encendida.')
  }

  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && token) alExpirar() // token vencido: vuelve al login
    throw new ApiError(res.status, data?.mensaje || 'Ocurrió un error inesperado', data?.errores)
  }
  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body = {}) => request('POST', path, body),
  put: (path, body = {}) => request('PUT', path, body),
  patch: (path, body = {}) => request('PATCH', path, body),
  del: (path) => request('DELETE', path),
}
