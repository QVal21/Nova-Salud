import mongoose from 'mongoose'
import Producto from '../models/Producto.js'
import Movimiento from '../models/Movimiento.js'
import { siguiente } from '../models/Contador.js'
import AppError from '../utils/AppError.js'
import { escaparRegex, esId, texto, validar } from '../utils/helpers.js'
import { fechaLima } from '../utils/fechas.js'

// Limpia y valida los datos del formulario. El stock NO se toma aquí:
// solo cambia con ventas o movimientos, así queda trazabilidad.
function limpiar(d) {
  const datos = {
    nombre: texto(d.nombre),
    presentacion: texto(d.presentacion),
    categoria: texto(d.categoria),
    laboratorio: texto(d.laboratorio),
    precio: Number(d.precio),
    minimo: Number(d.minimo),
    lote: texto(d.lote),
    vence: d.vence ? fechaLima(d.vence) : null,
    receta: Boolean(d.receta),
    proveedor: d.proveedorId ?? d.proveedor ?? undefined,
  }
  validar([
    ['nombre', !datos.nombre, 'Ingresa el nombre'],
    ['presentacion', !datos.presentacion, 'Ingresa la presentación'],
    ['categoria', !datos.categoria, 'Ingresa la categoría'],
    ['precio', !(datos.precio > 0), 'El precio debe ser mayor a 0'],
    ['minimo', !Number.isInteger(datos.minimo) || datos.minimo < 0, 'Mínimo inválido'],
    ['lote', !datos.lote, 'Ingresa el lote'],
    ['vence', !datos.vence || Number.isNaN(datos.vence.getTime()), 'Ingresa una fecha de vencimiento válida'],
    ['proveedorId', datos.proveedor !== undefined && datos.proveedor !== '' && !esId(datos.proveedor), 'Proveedor no válido'],
  ])
  if (datos.proveedor === '') datos.proveedor = undefined
  return datos
}

export function listar({ q, categoria }) {
  const filtro = { activo: true }
  if (categoria) filtro.categoria = categoria
  if (q) {
    const re = new RegExp(escaparRegex(q), 'i')
    filtro.$or = [{ nombre: re }, { codigo: re }, { laboratorio: re }, { lote: re }]
  }
  return Producto.find(filtro).sort({ nombre: 1 })
}

export const categorias = () => Producto.distinct('categoria', { activo: true })

export async function obtener(id) {
  validar([['id', !esId(id), 'Identificador no válido']])
  const p = await Producto.findOne({ _id: id, activo: true })
  if (!p) throw new AppError(404, 'Producto no encontrado')
  return p
}

export async function crear(d, usuario) {
  const datos = limpiar(d)
  const stockInicial = Number(d.stock ?? 0)
  validar([['stock', !Number.isInteger(stockInicial) || stockInicial < 0, 'Stock inicial inválido']])

  const session = await mongoose.startSession()
  try {
    let producto
    await session.withTransaction(async () => {
      const n = await siguiente('producto', session)
      ;[producto] = await Producto.create([{ ...datos, codigo: `P${String(n).padStart(4, '0')}`, stock: stockInicial }], { session })
      if (stockInicial > 0) {
        await Movimiento.create(
          [{ tipo: 'entrada', producto: producto._id, productoNombre: producto.nombre, cantidad: stockInicial, stockFinal: stockInicial, motivo: 'Stock inicial', usuario: usuario.id, usuarioNombre: usuario.nombre }],
          { session },
        )
      }
    })
    return producto
  } finally {
    await session.endSession()
  }
}

export async function actualizar(id, d) {
  const p = await obtener(id)
  Object.assign(p, limpiar(d))
  return p.save()
}

// Baja lógica: se conserva el historial de ventas y movimientos
export async function eliminar(id) {
  const p = await obtener(id)
  p.activo = false
  await p.save()
}
