import bcrypt from 'bcryptjs'
import Usuario from '../models/Usuario.js'
import AppError from '../utils/AppError.js'
import { esId, texto, validar } from '../utils/helpers.js'

const ROLES = ['admin', 'vendedor']

export const listar = () => Usuario.find().sort({ nombre: 1 })

export async function crear(datos) {
  const nombre = texto(datos.nombre)
  const usuario = texto(datos.usuario).toLowerCase()
  const rol = datos.rol ?? 'vendedor'
  validar([
    ['nombre', !nombre, 'Ingresa el nombre'],
    ['usuario', !/^[a-z0-9._]{4,}$/.test(usuario), 'Mínimo 4 caracteres: minúsculas, números, punto o guion bajo'],
    ['rol', !ROLES.includes(rol), 'Rol no válido'],
    ['clave', typeof datos.clave !== 'string' || datos.clave.length < 6, 'La contraseña debe tener al menos 6 caracteres'],
  ])
  if (await Usuario.exists({ usuario })) throw new AppError(409, 'Ese usuario ya existe', { usuario: 'Ese usuario ya existe' })

  const clave = await bcrypt.hash(datos.clave, 10)
  return Usuario.create({ nombre, usuario, rol, clave })
}

export async function actualizar(id, datos, actual) {
  validar([['id', !esId(id), 'Identificador no válido']])
  const u = await Usuario.findById(id)
  if (!u) throw new AppError(404, 'Usuario no encontrado')

  const esUnoMismo = String(u._id) === actual.id
  if (esUnoMismo && (datos.activo === false || (datos.rol && datos.rol !== 'admin'))) {
    throw new AppError(400, 'No puedes desactivarte ni quitarte el rol de administrador')
  }

  if (datos.nombre !== undefined) u.nombre = texto(datos.nombre) || u.nombre
  if (datos.rol !== undefined) {
    validar([['rol', !ROLES.includes(datos.rol), 'Rol no válido']])
    u.rol = datos.rol
  }
  if (datos.activo !== undefined) u.activo = Boolean(datos.activo)
  if (datos.clave !== undefined) {
    validar([['clave', typeof datos.clave !== 'string' || datos.clave.length < 6, 'La contraseña debe tener al menos 6 caracteres']])
    u.clave = await bcrypt.hash(datos.clave, 10)
  }
  return u.save()
}
