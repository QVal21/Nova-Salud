import mongoose from 'mongoose'
import Producto from '../models/Producto.js'
import Movimiento from '../models/Movimiento.js'
import AppError from '../utils/AppError.js'
import { esId, texto, validar } from '../utils/helpers.js'

const TIPOS = ['entrada', 'salida', 'ajuste']

/**
 * Aplica un movimiento de stock de forma atómica dentro de una sesión.
 * - entrada: suma la cantidad
 * - salida: resta, solo si hay stock suficiente (la condición va en el mismo update)
 * - ajuste: fija el stock al conteo físico y registra la diferencia
 * Se reutiliza al recibir pedidos.
 */
export async function aplicarMovimiento({ tipo, productoId, cantidad, motivo, referencia }, usuario, session) {
  const filtro = { _id: productoId, activo: true }
  let cambio
  if (tipo === 'entrada') cambio = { $inc: { stock: cantidad } }
  if (tipo === 'salida') {
    filtro.stock = { $gte: cantidad }
    cambio = { $inc: { stock: -cantidad } }
  }
  if (tipo === 'ajuste') cambio = { $set: { stock: cantidad } }

  const antes = await Producto.findOneAndUpdate(filtro, cambio, { new: false, session })
  if (!antes) {
    const existe = await Producto.findById(productoId).session(session)
    if (!existe || !existe.activo) throw new AppError(404, 'Producto no encontrado')
    throw new AppError(409, `Stock insuficiente: quedan ${existe.stock} unidades de ${existe.nombre}`)
  }

  const delta = tipo === 'entrada' ? cantidad : tipo === 'salida' ? -cantidad : cantidad - antes.stock
  const [mov] = await Movimiento.create(
    [
      {
        tipo,
        producto: antes._id,
        productoNombre: antes.nombre,
        cantidad: delta,
        stockFinal: antes.stock + delta,
        motivo,
        referencia,
        usuario: usuario.id,
        usuarioNombre: usuario.nombre,
      },
    ],
    { session },
  )
  return mov
}

export async function registrar(datos, usuario) {
  const tipo = datos.tipo
  const cantidad = Number(datos.cantidad)
  const motivo = texto(datos.motivo)
  validar([
    ['tipo', !TIPOS.includes(tipo), 'Tipo de movimiento no válido'],
    ['productoId', !esId(datos.productoId), 'Selecciona un producto'],
    ['cantidad', !Number.isInteger(cantidad) || cantidad < 0, 'Ingresa una cantidad entera válida'],
    ['cantidad', tipo !== 'ajuste' && cantidad === 0, 'La cantidad debe ser mayor a 0'],
    ['motivo', !motivo, 'Indica el motivo'],
  ])
  if (tipo === 'ajuste' && usuario.rol !== 'admin') {
    throw new AppError(403, 'Solo el administrador puede hacer ajustes de inventario')
  }

  const session = await mongoose.startSession()
  try {
    let mov
    await session.withTransaction(async () => {
      mov = await aplicarMovimiento({ tipo, productoId: datos.productoId, cantidad, motivo }, usuario, session)
    })
    return mov
  } finally {
    await session.endSession()
  }
}

export function listar({ tipo, productoId, limite = 200 }) {
  const filtro = {}
  if (TIPOS.includes(tipo)) filtro.tipo = tipo
  if (esId(productoId)) filtro.producto = productoId
  return Movimiento.find(filtro).sort({ fecha: -1 }).limit(Math.min(Number(limite) || 200, 500))
}
