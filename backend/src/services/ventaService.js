import mongoose from 'mongoose'
import Producto from '../models/Producto.js'
import Venta from '../models/Venta.js'
import Cliente from '../models/Cliente.js'
import Movimiento from '../models/Movimiento.js'
import { siguiente } from '../models/Contador.js'
import AppError from '../utils/AppError.js'
import { escaparRegex, esId, redondear, texto, validar } from '../utils/helpers.js'
import { fechaLima } from '../utils/fechas.js'

/**
 * Registra una venta en una transacción:
 * 1) descuenta el stock de cada producto solo si alcanza (si uno falla, se revierte todo)
 * 2) genera el número de comprobante correlativo
 * 3) guarda la venta y un movimiento de salida por producto
 * Los precios se toman de la base de datos, nunca del cliente.
 */
export async function registrar(datos, usuario) {
  const tipo = datos.tipo ?? 'boleta'
  const metodo = datos.metodo ?? 'efectivo'
  const documento = texto(datos.documento)
  const items = Array.isArray(datos.items) ? datos.items : []

  validar([
    ['items', items.length === 0, 'Agrega al menos un producto'],
    ['items', items.some((i) => !esId(i.productoId) || !Number.isInteger(i.cantidad) || i.cantidad <= 0), 'Hay productos o cantidades no válidas'],
    ['tipo', !['boleta', 'factura'].includes(tipo), 'Tipo de comprobante no válido'],
    ['metodo', !['efectivo', 'tarjeta', 'yape'].includes(metodo), 'Método de pago no válido'],
    ['documento', tipo === 'factura' && !/^\d{11}$/.test(documento), 'Para factura ingresa un RUC de 11 dígitos'],
    ['documento', tipo === 'boleta' && documento !== '' && !/^\d{8}$/.test(documento), 'El DNI debe tener 8 dígitos'],
  ])

  // Si el mismo producto viene dos veces, se suman las cantidades
  const cantidades = new Map()
  for (const i of items) cantidades.set(String(i.productoId), (cantidades.get(String(i.productoId)) ?? 0) + i.cantidad)

  const cliente = tipo === 'boleta' && documento ? await Cliente.findOne({ dni: documento }) : null
  const datosCliente = cliente
    ? { ref: cliente._id, nombre: cliente.nombre, documento }
    : documento
      ? { nombre: tipo === 'factura' ? `RUC ${documento}` : `DNI ${documento}`, documento }
      : undefined

  const session = await mongoose.startSession()
  try {
    let venta
    await session.withTransaction(async () => {
      const detalle = []
      const salidas = []

      for (const [productoId, cantidad] of cantidades) {
        const p = await Producto.findOneAndUpdate(
          { _id: productoId, activo: true, stock: { $gte: cantidad } },
          { $inc: { stock: -cantidad } },
          { new: true, session },
        )
        if (!p) {
          const existe = await Producto.findById(productoId).session(session)
          if (!existe || !existe.activo) throw new AppError(404, 'Uno de los productos ya no existe')
          throw new AppError(409, `Stock insuficiente de ${existe.nombre}: quedan ${existe.stock} unidades`)
        }
        detalle.push({ producto: p._id, nombre: p.nombre, presentacion: p.presentacion, precio: p.precio, cantidad, subtotal: redondear(p.precio * cantidad) })
        salidas.push({ tipo: 'salida', producto: p._id, productoNombre: p.nombre, cantidad: -cantidad, stockFinal: p.stock, usuario: usuario.id, usuarioNombre: usuario.nombre })
      }

      const total = redondear(detalle.reduce((s, i) => s + i.subtotal, 0))
      const serie = tipo === 'factura' ? 'F001' : 'B001'
      const comprobante = `${serie}-${String(await siguiente(serie, session)).padStart(6, '0')}`
      const duracion = Number(datos.duracionSegundos)

      ;[venta] = await Venta.create(
        [
          {
            comprobante, tipo, metodo, cliente: datosCliente, items: detalle, total,
            opGravada: redondear(total / 1.18),
            igv: redondear(total - total / 1.18),
            vendedor: usuario.id,
            vendedorNombre: usuario.nombre,
            duracionSegundos: Number.isFinite(duracion) && duracion > 0 ? Math.round(duracion) : undefined,
          },
        ],
        { session },
      )

      await Movimiento.create(
        salidas.map((m) => ({ ...m, motivo: `Venta ${comprobante}`, referencia: venta._id })),
        { session, ordered: true },
      )
    })
    return venta
  } finally {
    await session.endSession()
  }
}

export function listar({ q, desde, hasta, limite = 200 }) {
  const filtro = {}
  if (desde || hasta) {
    filtro.fecha = {}
    if (desde) filtro.fecha.$gte = fechaLima(desde)
    if (hasta) filtro.fecha.$lt = new Date(fechaLima(hasta).getTime() + 86400000) // incluye todo el día
  }
  if (q) {
    const re = new RegExp(escaparRegex(q), 'i')
    filtro.$or = [{ comprobante: re }, { 'cliente.nombre': re }, { 'cliente.documento': re }]
  }
  return Venta.find(filtro).sort({ fecha: -1 }).limit(Math.min(Number(limite) || 200, 500))
}

export async function obtener(id) {
  validar([['id', !esId(id), 'Identificador no válido']])
  const v = await Venta.findById(id)
  if (!v) throw new AppError(404, 'Venta no encontrada')
  return v
}
