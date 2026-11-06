import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, guardarSesion, leerSesion, onSesionExpirada } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion) // { token, usuario }

  const logout = useCallback(() => {
    guardarSesion(null)
    setSesion(null)
  }, [])

  useEffect(() => onSesionExpirada(logout), [logout])

  const login = async (usuario, clave) => {
    const datos = await api.post('/auth/login', { usuario, clave })
    guardarSesion(datos)
    setSesion(datos)
    return datos.usuario
  }

  return <AuthContext.Provider value={{ user: sesion?.usuario ?? null, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
