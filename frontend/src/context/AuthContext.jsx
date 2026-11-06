import { createContext, useContext, useState } from 'react'

// Maqueta: la sesión se guarda en localStorage.
// Cuando exista el backend, login() llamará a POST /api/auth/login y guardará el JWT.
const AuthContext = createContext(null)
const KEY = 'nova-salud-sesion'

function leerSesion() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(leerSesion)

  const login = (datos) => {
    setUser(datos)
    try {
      localStorage.setItem(KEY, JSON.stringify(datos))
    } catch {}
  }

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem(KEY)
    } catch {}
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
