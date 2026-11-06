import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppLayout from './layouts/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PuntoVenta from './pages/PuntoVenta'
import Inventario from './pages/Inventario'
import Movimientos from './pages/Movimientos'
import Alertas from './pages/Alertas'
import Ventas from './pages/Ventas'
import Clientes from './pages/Clientes'
import Proveedores from './pages/Proveedores'
import Reportes from './pages/Reportes'
import Usuarios from './pages/Usuarios'

function RequireAuth({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function RequireRole({ rol, children }) {
  const { user } = useAuth()
  return user?.rol === rol ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="punto-venta" element={<PuntoVenta />} />
        <Route path="inventario" element={<Inventario />} />
        <Route path="movimientos" element={<Movimientos />} />
        <Route path="alertas" element={<Alertas />} />
        <Route path="ventas" element={<Ventas />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="proveedores" element={<RequireRole rol="admin"><Proveedores /></RequireRole>} />
        <Route path="reportes" element={<RequireRole rol="admin"><Reportes /></RequireRole>} />
        <Route path="usuarios" element={<RequireRole rol="admin"><Usuarios /></RequireRole>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
