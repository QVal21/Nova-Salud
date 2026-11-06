import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario.js'
import AppError from '../utils/AppError.js'
import { texto, validar } from '../utils/helpers.js'

export async function login({ usuario, clave }) {
  const u = texto(usuario).toLowerCase()
  validar([
    ['usuario', !u, 'Ingresa tu usuario'],
    ['clave', typeof clave !== 'string' || !clave, 'Ingresa tu contraseña'],
  ])

  const encontrado = await Usuario.findOne({ usuario: u }).select('+clave')
  // Mismo mensaje si no existe o si la clave falla: no revela qué usuarios existen
  if (!encontrado || !(await bcrypt.compare(clave, encontrado.clave))) {
    throw new AppError(401, 'Usuario o contraseña incorrectos')
  }
  if (!encontrado.activo) throw new AppError(403, 'Tu cuenta está desactivada. Consulta con el administrador')

  const payload = { id: encontrado.id, nombre: encontrado.nombre, rol: encontrado.rol }
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' })
  return { token, usuario: encontrado.toJSON() }
}

export async function perfil(id) {
  const u = await Usuario.findById(id)
  if (!u || !u.activo) throw new AppError(401, 'Tu sesión ya no es válida')
  return u
}
