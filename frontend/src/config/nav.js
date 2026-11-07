import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ArrowLeftRight,
  BellRing,
  Receipt,
  Users,
  Truck,
  BarChart3,
  UserCog,
} from 'lucide-react'

// roles: si no se indica, lo ven todos
export const navItems = [
  { path: '/', label: 'Panel', icon: LayoutDashboard, end: true },
  { path: '/punto-venta', label: 'Punto de venta', icon: ShoppingCart },
  { path: '/inventario', label: 'Inventario', icon: Package },
  { path: '/movimientos', label: 'Movimientos', icon: ArrowLeftRight },
  { path: '/alertas', label: 'Alertas', icon: BellRing },
  { path: '/ventas', label: 'Registro de ventas', icon: Receipt },
  { path: '/clientes', label: 'Clientes', icon: Users },
  { path: '/proveedores', label: 'Proveedores', icon: Truck, roles: ['admin'] },
  { path: '/reportes', label: 'Reportes', icon: BarChart3, roles: ['admin'] },
  { path: '/usuarios', label: 'Usuarios', icon: UserCog, roles: ['admin'] },
]
