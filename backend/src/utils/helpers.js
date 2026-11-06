import mongoose from 'mongoose'
import AppError from './AppError.js'

// Envuelve controladores async para que sus errores lleguen al middleware de errores
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/**
 * Validación manual. Recibe reglas [campo, esInvalido, mensaje] y si alguna falla
 * lanza un 400 con los errores agrupados por campo (el frontend los muestra en cada input).
 */
export function validar(reglas) {
  const errores = {}
  for (const [campo, invalido, mensaje] of reglas) {
    if (invalido && !errores[campo]) errores[campo] = mensaje
  }
  if (Object.keys(errores).length) throw new AppError(400, 'Revisa los datos enviados', errores)
}

export const texto = (v) => (typeof v === 'string' ? v.trim() : '')
export const esId = (v) => mongoose.isValidObjectId(v)
export const redondear = (n) => Math.round(n * 100) / 100

// Para usar texto del usuario dentro de una expresión regular sin riesgos
export const escaparRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Opciones comunes de los esquemas: devuelve "id" en lugar de "_id" y nunca expone la clave
export const opcionesJSON = {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id
    delete ret.clave
    return ret
  },
}
