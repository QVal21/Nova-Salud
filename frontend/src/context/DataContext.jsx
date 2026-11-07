import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../services/api'
import { useAuth } from './AuthContext'

// Estado compartido cargado desde la API. Las páginas usan las mismas funciones que en la maqueta,
// pero ahora cada una llama al backend y luego recarga los datos afectados.
const DataContext = createContext(null)

export const DIAS_ALERTA_VENCE = 30

// ---- Adaptadores: dejan los datos del backend en la forma que usan las pantallas
const diaLima = (fecha) => (fecha ? new Date(fecha).toLocaleDateString('en-CA', { timeZone: 'America/Lima' }) : '')
const idDe = (ref) => (ref && typeof ref === 'object' ? ref.id : ref ?? '')

export const normProducto = (p) => ({ ...p, proveedorId: idDe(p.proveedor), vence: diaLima(p.vence) })

export const normAlerta = (a) => ({
  ...normProducto(a),
  key: `${a.id}-${a.tipo}`,
  proveedorNombre: a.proveedor?.razonSocial ?? '—',
})

export const normVenta = (v) => ({
  ...v,
  vendedor: v.vendedorNombre,
  cliente: v.cliente?.nombre ? { id: v.cliente.ref, nombre: v.cliente.nombre, dni: v.cliente.documento } : null,
  items: v.items.map((i) => ({ ...i, id: i.producto })),
})

const normMovimiento = (m) => ({ ...m, productoId: idDe(m.producto), usuario: m.usuarioNombre })

const normPedido = (p) => ({
  ...p,
  productoId: idDe(p.producto),
  productoNombre: p.producto?.nombre ?? '—',
  proveedorId: idDe(p.proveedor),
  proveedorNombre: p.proveedor?.razonSocial ?? '—',
})

const igual = (x) => x

const RECURSOS = {
  productos: ['/productos', normProducto],
  ventas: ['/ventas', normVenta],
  movimientos: ['/movimientos', normMovimiento],
  clientes: ['/clientes', igual],
  proveedores: ['/proveedores', igual],
  pedidos: ['/pedidos', normPedido],
  alertas: ['/alertas', normAlerta],
  usuarios: ['/usuarios', igual], // solo admin
}

const VACIO = Object.fromEntries(Object.keys(RECURSOS).map((k) => [k, []]))

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [datos, setDatos] = useState(VACIO)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const recargar = useCallback(
    async (nombres = Object.keys(RECURSOS)) => {
      const lista = nombres.filter((n) => n !== 'usuarios' || user?.rol === 'admin')
      const resultados = await Promise.all(
        lista.map(async (n) => {
          const [ruta, adaptar] = RECURSOS[n]
          const respuesta = await api.get(ruta)
          return [n, respuesta.map(adaptar)]
        }),
      )
      setDatos((d) => ({ ...d, ...Object.fromEntries(resultados) }))
    },
    [user?.rol],
  )

  useEffect(() => {
    if (!user) {
      setDatos(VACIO)
      return
    }
    setCargando(true)
    setError('')
    recargar()
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }, [user?.id, recargar])

  // Para acciones de un clic (sin formulario): muestra el error arriba de la pantalla
  const ejecutar = async (accion) => {
    try {
      setError('')
      await accion()
    } catch (e) {
      setError(e.message)
    }
  }

  // ---- Acciones (lanzan ApiError para que los formularios muestren errores por campo)
  const registrarVenta = async (payload) => {
    const venta = await api.post('/ventas', payload)
    recargar(['productos', 'ventas', 'movimientos', 'alertas', 'clientes']).catch(() => { })
    return normVenta(venta)
  }

  const registrarMovimiento = async (payload) => {
    const mov = await api.post('/movimientos', payload)
    await recargar(['productos', 'movimientos', 'alertas'])
    return normMovimiento(mov)
  }

  const guardarProducto = async (producto) => {
    if (producto.id) await api.put(`/productos/${producto.id}`, producto)
    else await api.post('/productos', producto)
    await recargar(['productos', 'movimientos', 'alertas'])
  }

  // Devuelve el cliente creado; se recargan también las ventas porque el backend vincula las anteriores con ese DNI
  const guardarCliente = async (cliente) => {
    const creado = await api.post('/clientes', cliente)
    await recargar(['clientes', 'ventas'])
    return creado
  }

  const guardarProveedor = async (proveedor) => {
    await api.post('/proveedores', proveedor)
    await recargar(['proveedores'])
  }

  const guardarUsuario = async (usuario) => {
    await api.post('/usuarios', usuario)
    await recargar(['usuarios'])
  }

  const alternarUsuario = async (u) => {
    await api.patch(`/usuarios/${u.id}`, { activo: !u.activo })
    await recargar(['usuarios'])
  }

  const generarPedido = async (producto, cantidad) => {
    await api.post('/pedidos', { productoId: producto.id, cantidad })
    await recargar(['pedidos', 'alertas'])
  }

  const recibirPedido = async (pedido) => {
    await api.patch(`/pedidos/${pedido.id}/recibir`)
    await recargar(['pedidos', 'productos', 'movimientos', 'alertas'])
  }

  const valor = {
    ...datos, cargando, error, setError, recargar, ejecutar,
    registrarVenta, registrarMovimiento, guardarProducto, guardarCliente, guardarProveedor,
    guardarUsuario, alternarUsuario, generarPedido, recibirPedido,
  }

  return <DataContext.Provider value={valor}>{children}</DataContext.Provider>
}

export const useData = () => useContext(DataContext)
