import Proveedor from '../models/Proveedor.js'
import AppError from '../utils/AppError.js'
import { esId, texto, validar } from '../utils/helpers.js'

function limpiar(d) {
  const datos = {
    ruc: texto(d.ruc),
    razonSocial: texto(d.razonSocial),
    contacto: texto(d.contacto),
    telefono: texto(d.telefono),
    email: texto(d.email).toLowerCase(),
  }
  validar([
    ['ruc', !/^(10|20)\d{9}$/.test(datos.ruc), 'El RUC debe tener 11 dígitos y empezar con 10 o 20'],
    ['razonSocial', !datos.razonSocial, 'Ingresa la razón social'],
    ['telefono', datos.telefono !== '' && !/^\d{9}$/.test(datos.telefono), 'El teléfono debe tener 9 dígitos'],
    ['email', datos.email !== '' && !/^\S+@\S+\.\S+$/.test(datos.email), 'Correo no válido'],
  ])
  return datos
}

export const listar = () => Proveedor.find().sort({ razonSocial: 1 })

export async function crear(d) {
  const datos = limpiar(d)
  if (await Proveedor.exists({ ruc: datos.ruc })) throw new AppError(409, 'Ya existe un proveedor con ese RUC', { ruc: 'RUC repetido' })
  return Proveedor.create(datos)
}

export async function actualizar(id, d) {
  validar([['id', !esId(id), 'Identificador no válido']])
  const p = await Proveedor.findById(id)
  if (!p) throw new AppError(404, 'Proveedor no encontrado')
  Object.assign(p, limpiar({ ...p.toJSON(), ...d }))
  return p.save()
}
