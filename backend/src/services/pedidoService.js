import mongoose from 'mongoose'
import Pedido from '../models/Pedido.js'
import Producto from '../models/Producto.js'
import AppError from '../utils/AppError.js'
import { esId, validar } from '../utils/helpers.js'
import { aplicarMovimiento } from './movimientoService.js'

export const listar = () =>
  Pedido.find().populate('producto', 'nombre presentacion stock').populate('proveedor', 'razonSocial').sort({ fecha: -1 })

export async function generar(datos, usuario) {
  validar([['productoId', !esId(datos.productoId), 'Selecciona un producto']])
  const producto = await Producto.findOne({ _id: datos.productoId, activo: true })
  if (!producto) throw new AppError(404, 'Producto no encontrado')
  if (!producto.proveedor) throw new AppError(400, 'El producto no tiene proveedor asignado')
  if (await Pedido.exists({ producto: producto._id, estado: 'pendiente' })) {
    throw new AppError(409, 'Ya hay un pedido pendiente para este producto')
  }

  const sugerido = Math.max(producto.minimo * 2 - producto.stock, producto.minimo, 1)
  const cantidad = datos.cantidad === undefined ? sugerido : Number(datos.cantidad)
  validar([['cantidad', !Number.isInteger(cantidad) || cantidad <= 0, 'La cantidad debe ser un entero mayor a 0']])

  const pedido = await Pedido.create({ producto: producto._id, proveedor: producto.proveedor, cantidad, creadoPor: usuario.nombre })
  return pedido.populate([{ path: 'producto', select: 'nombre presentacion stock' }, { path: 'proveedor', select: 'razonSocial' }])
}

// Marca el pedido como recibido y suma el stock en la misma transacción
export async function recibir(id, usuario) {
  validar([['id', !esId(id), 'Identificador no válido']])
  const session = await mongoose.startSession()
  try {
    let pedido
    await session.withTransaction(async () => {
      pedido = await Pedido.findOneAndUpdate(
        { _id: id, estado: 'pendiente' },
        { $set: { estado: 'recibido', recibidoEn: new Date() } },
        { new: true, session },
      )
      if (!pedido) throw new AppError(409, 'El pedido no existe o ya fue recibido')
      await aplicarMovimiento(
        { tipo: 'entrada', productoId: pedido.producto, cantidad: pedido.cantidad, motivo: 'Pedido de reposición recibido', referencia: pedido._id },
        usuario,
        session,
      )
    })
    return pedido
  } finally {
    await session.endSession()
  }
}
