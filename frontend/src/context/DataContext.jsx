import { createContext, useContext, useMemo, useState } from 'react'
import * as mock from '../data/mock'
import { diasHasta } from '../utils/format'

// Estado compartido de la maqueta. Cada función de aquí será luego una llamada a la API:
// registrarVenta -> POST /api/ventas, registrarMovimiento -> POST /api/movimientos, etc.
const DataContext = createContext(null)

export const DIAS_ALERTA_VENCE = 30

const siguienteId = (lista) => Math.max(0, ...lista.map((x) => x.id)) + 1

export function DataProvider({ children }) {
  const [productos, setProductos] = useState(mock.productos)
  const [ventas, setVentas] = useState(mock.ventas)
  const [movimientos, setMovimientos] = useState(mock.movimientos)
  const [clientes, setClientes] = useState(mock.clientes)
  const [proveedores, setProveedores] = useState(mock.proveedores)
  const [pedidos, setPedidos] = useState(mock.pedidos)
  const [usuarios, setUsuarios] = useState(mock.usuarios)

  // ---- Ventas: descuenta stock y deja registro de salida por cada producto
  const registrarVenta = ({ items, cliente, tipo, metodo, vendedor }) => {
    const serie = tipo === 'factura' ? 'F001' : 'B001'
    const numero = siguienteId(ventas)
    const venta = {
      id: numero,
      comprobante: `${serie}-${String(numero).padStart(6, '0')}`,
      fecha: new Date().toISOString(),
      tipo,
      metodo,
      vendedor,
      cliente,
      items,
      total: items.reduce((s, i) => s + i.precio * i.cantidad, 0),
    }
    const base = siguienteId(movimientos)
    const nuevosMovs = items.map((i, k) => {
      const p = productos.find((x) => x.id === i.id)
      return {
        id: base + k,
        fecha: venta.fecha,
        tipo: 'salida',
        productoId: i.id,
        cantidad: -i.cantidad,
        stockFinal: p.stock - i.cantidad,
        motivo: `Venta ${venta.comprobante}`,
        usuario: vendedor,
      }
    })
    setVentas((vs) => [venta, ...vs])
    setMovimientos((ms) => [...nuevosMovs, ...ms])
    setProductos((ps) =>
      ps.map((p) => {
        const it = items.find((i) => i.id === p.id)
        return it ? { ...p, stock: p.stock - it.cantidad } : p
      }),
    )
    return venta
  }

  // ---- Movimientos: entrada suma, salida resta, ajuste fija el stock al conteo físico
  const registrarMovimiento = ({ tipo, productoId, cantidad, motivo, usuario }) => {
    const p = productos.find((x) => x.id === productoId)
    const delta = tipo === 'entrada' ? cantidad : tipo === 'salida' ? -cantidad : cantidad - p.stock
    const mov = {
      id: siguienteId(movimientos),
      fecha: new Date().toISOString(),
      tipo,
      productoId,
      cantidad: delta,
      stockFinal: p.stock + delta,
      motivo,
      usuario,
    }
    setMovimientos((ms) => [mov, ...ms])
    setProductos((ps) => ps.map((x) => (x.id === productoId ? { ...x, stock: x.stock + delta } : x)))
    return mov
  }

  // ---- Productos (el stock solo cambia con movimientos o ventas)
  const guardarProducto = (datos) => {
    if (datos.id) {
      setProductos((ps) => ps.map((p) => (p.id === datos.id ? { ...p, ...datos, stock: p.stock } : p)))
    } else {
      const id = siguienteId(productos)
      setProductos((ps) => [...ps, { ...datos, id, codigo: `P${String(id).padStart(4, '0')}` }])
    }
  }

  const guardarCliente = (datos) => setClientes((cs) => [...cs, { ...datos, id: siguienteId(clientes) }])
  const guardarProveedor = (datos) => setProveedores((ps) => [...ps, { ...datos, id: siguienteId(proveedores) }])
  const guardarUsuario = (datos) => setUsuarios((us) => [...us, { ...datos, id: siguienteId(usuarios), activo: true }])
  const alternarUsuario = (id) => setUsuarios((us) => us.map((u) => (u.id === id ? { ...u, activo: !u.activo } : u)))

  // ---- Pedidos de reposición
  const generarPedido = (producto) => {
    const cantidad = Math.max(producto.minimo * 2 - producto.stock, producto.minimo)
    setPedidos((ps) => [
      { id: siguienteId(pedidos), fecha: new Date().toISOString(), productoId: producto.id, proveedorId: producto.proveedorId, cantidad, estado: 'pendiente' },
      ...ps,
    ])
  }

  const recibirPedido = (pedido, usuario) => {
    setPedidos((ps) => ps.map((p) => (p.id === pedido.id ? { ...p, estado: 'recibido' } : p)))
    registrarMovimiento({ tipo: 'entrada', productoId: pedido.productoId, cantidad: pedido.cantidad, motivo: 'Pedido de reposición recibido', usuario })
  }

  // ---- Alertas calculadas a partir del inventario
  const alertas = useMemo(() => {
    const lista = []
    for (const p of productos) {
      if (p.stock <= p.minimo) lista.push({ ...p, key: `${p.id}-bajo`, tipo: 'bajo' })
      const dias = diasHasta(p.vence)
      if (dias <= DIAS_ALERTA_VENCE) lista.push({ ...p, key: `${p.id}-vence`, tipo: 'vence', dias })
    }
    return lista
  }, [productos])

  const valor = {
    productos, ventas, movimientos, clientes, proveedores, pedidos, usuarios, alertas,
    registrarVenta, registrarMovimiento, guardarProducto, guardarCliente, guardarProveedor,
    guardarUsuario, alternarUsuario, generarPedido, recibirPedido,
  }

  return <DataContext.Provider value={valor}>{children}</DataContext.Provider>
}

export const useData = () => useContext(DataContext)
