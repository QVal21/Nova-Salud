import Cliente from '../models/Cliente.js'
import Venta from '../models/Venta.js'
import AppError from '../utils/AppError.js'
import { escaparRegex, esId, texto, validar } from '../utils/helpers.js'

function limpiar(d) {
  const datos = {
    dni: texto(d.dni),
    nombre: texto(d.nombre),
    telefono: texto(d.telefono),
    email: texto(d.email).toLowerCase(),
  }
  validar([
    ['dni', !/^\d{8}$/.test(datos.dni), 'El DNI debe tener 8 dígitos'],
    ['nombre', !datos.nombre, 'Ingresa el nombre completo'],
    ['telefono', datos.telefono !== '' && !/^9\d{8}$/.test(datos.telefono), 'El celular debe tener 9 dígitos y empezar con 9'],
    ['email', datos.email !== '' && !/^\S+@\S+\.\S+$/.test(datos.email), 'Correo no válido'],
  ])
  return datos
}

// Lista con resumen de compras de cada cliente (cantidad, total y última fecha)
export async function listar({ q }) {
  const filtro = {}
  if (q) {
    const re = new RegExp(escaparRegex(q), 'i')
    filtro.$or = [{ nombre: re }, { dni: re }, { telefono: re }]
  }
  const clientes = await Cliente.find(filtro).sort({ nombre: 1 })
  const resumen = await Venta.aggregate([
    { $match: { 'cliente.ref': { $in: clientes.map((c) => c._id) } } },
    { $group: { _id: '$cliente.ref', compras: { $sum: 1 }, total: { $sum: '$total' }, ultimaCompra: { $max: '$fecha' } } },
  ])
  const porId = new Map(resumen.map((r) => [String(r._id), r]))
  return clientes.map((c) => {
    const r = porId.get(String(c._id))
    return { ...c.toJSON(), compras: r?.compras ?? 0, totalComprado: r?.total ?? 0, ultimaCompra: r?.ultimaCompra ?? null }
  })
}

export async function crear(d) {
  const datos = limpiar(d)
  if (await Cliente.exists({ dni: datos.dni })) throw new AppError(409, 'Ya existe un cliente con este DNI', { dni: 'Ya existe un cliente con este DNI' })
  return Cliente.create(datos)
}

export async function actualizar(id, d) {
  validar([['id', !esId(id), 'Identificador no válido']])
  const c = await Cliente.findById(id)
  if (!c) throw new AppError(404, 'Cliente no encontrado')
  Object.assign(c, limpiar({ ...c.toJSON(), ...d }))
  return c.save()
}

export async function compras(id) {
  validar([['id', !esId(id), 'Identificador no válido']])
  return Venta.find({ 'cliente.ref': id }).sort({ fecha: -1 })
}
