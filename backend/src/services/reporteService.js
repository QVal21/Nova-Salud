import Venta from '../models/Venta.js'
import Producto from '../models/Producto.js'
import Movimiento from '../models/Movimiento.js'
import { inicioDiaLima, ZONA } from '../utils/fechas.js'
import { redondear } from '../utils/helpers.js'
import * as alertaService from './alertaService.js'

const diaLima = (fecha) => new Date(fecha).toLocaleDateString('en-CA', { timeZone: ZONA }) // AAAA-MM-DD

// Datos del panel principal (lo ven todos los roles)
export async function resumen() {
  const hoy = inicioDiaLima(0)
  const hace7 = inicioDiaLima(-6)

  const [delDia] = await Venta.aggregate([
    { $match: { fecha: { $gte: hoy } } },
    { $group: { _id: null, total: { $sum: '$total' }, comprobantes: { $sum: 1 }, duracion: { $avg: '$duracionSegundos' } } },
  ])

  const porDia = await Venta.aggregate([
    { $match: { fecha: { $gte: hace7 } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$fecha', timezone: ZONA } }, total: { $sum: '$total' } } },
  ])
  const mapa = new Map(porDia.map((d) => [d._id, d.total]))
  const semana = Array.from({ length: 7 }, (_, i) => {
    const fecha = diaLima(inicioDiaLima(i - 6))
    return { fecha, total: redondear(mapa.get(fecha) ?? 0) }
  })

  const masVendidos = await Venta.aggregate([
    { $match: { fecha: { $gte: hace7 } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.producto', nombre: { $first: '$items.nombre' }, unidades: { $sum: '$items.cantidad' } } },
    { $sort: { unidades: -1 } },
    { $limit: 5 },
    { $project: { _id: 0, productoId: '$_id', nombre: 1, unidades: 1 } },
  ])

  const alertas = await alertaService.listar()

  return {
    hoy: {
      total: redondear(delDia?.total ?? 0),
      comprobantes: delDia?.comprobantes ?? 0,
      tiempoPromedioSegundos: delDia?.duracion ? Math.round(delDia.duracion) : null,
    },
    semana,
    masVendidos,
    alertas: {
      total: alertas.length,
      stockBajo: alertas.filter((a) => a.tipo === 'bajo').length,
      porVencer: alertas.filter((a) => a.tipo === 'vence').length,
      lista: alertas.slice(0, 6),
    },
  }
}

// Indicadores de efectividad (pregunta guía 5). Últimos 30 días.
export async function indicadores() {
  const desde = inicioDiaLima(-29)

  const [atencion] = await Venta.aggregate([
    { $match: { fecha: { $gte: desde }, duracionSegundos: { $gt: 0 } } },
    { $group: { _id: null, promedio: { $avg: '$duracionSegundos' } } },
  ])

  const productos = await Producto.find({ activo: true })
  const stockTotal = productos.reduce((s, p) => s + p.stock, 0)
  const hoy = inicioDiaLima(0)
  const quiebres = productos.filter((p) => p.stock <= 0).length
  const merma = productos.filter((p) => p.vence < hoy).reduce((s, p) => s + p.stock * p.precio, 0)

  const [ajustes] = await Movimiento.aggregate([
    { $match: { tipo: 'ajuste', fecha: { $gte: desde } } },
    { $group: { _id: null, unidades: { $sum: { $abs: '$cantidad' } } } },
  ])
  const exactitud = stockTotal ? 100 - ((ajustes?.unidades ?? 0) / stockTotal) * 100 : 100

  const porHora = await Venta.aggregate([
    { $match: { fecha: { $gte: desde } } },
    { $group: { _id: { $hour: { date: '$fecha', timezone: ZONA } }, total: { $sum: '$total' }, ventas: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, hora: '$_id', total: { $round: ['$total', 2] }, ventas: 1 } },
  ])

  const porCategoria = await Venta.aggregate([
    { $match: { fecha: { $gte: desde } } },
    { $unwind: '$items' },
    { $lookup: { from: 'productos', localField: 'items.producto', foreignField: '_id', as: 'prod' } },
    { $group: { _id: { $ifNull: [{ $first: '$prod.categoria' }, 'Otros'] }, total: { $sum: '$items.subtotal' } } },
    { $sort: { total: -1 } },
    { $project: { _id: 0, categoria: '$_id', total: { $round: ['$total', 2] } } },
  ])

  return {
    periodoDias: 30,
    tiempoPromedioSegundos: atencion ? Math.round(atencion.promedio) : null,
    exactitudInventario: redondear(Math.max(0, exactitud)),
    quiebresStock: quiebres,
    mermaVencimiento: redondear(merma),
    ventasPorHora: porHora,
    ventasPorCategoria: porCategoria,
  }
}
