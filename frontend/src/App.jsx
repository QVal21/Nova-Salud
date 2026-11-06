import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppLayout from './layouts/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Placeholder from './pages/Placeholder'

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
        <Route path="punto-venta" element={<Placeholder />} />
        <Route path="inventario" element={<Placeholder />} />
        <Route path="movimientos" element={<Placeholder />} />
        <Route path="alertas" element={<Placeholder />} />
        <Route path="ventas" element={<Placeholder />} />
        <Route path="clientes" element={<Placeholder />} />
        <Route path="proveedores" element={<RequireRole rol="admin"><Placeholder /></RequireRole>} />
        <Route path="reportes" element={<RequireRole rol="admin"><Placeholder /></RequireRole>} />
        <Route path="usuarios" element={<RequireRole rol="admin"><Placeholder /></RequireRole>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
