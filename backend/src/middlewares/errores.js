import AppError from '../utils/AppError.js'

export const rutaNoEncontrada = (req, res, next) => next(new AppError(404, `No existe la ruta ${req.method} ${req.originalUrl}`))

// Respuesta de error uniforme: { mensaje, errores? }
// eslint-disable-next-line no-unused-vars
export function manejarErrores(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ mensaje: err.message, errores: err.errores })
  }
  if (err.name === 'ValidationError') {
    const errores = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]))
    return res.status(400).json({ mensaje: 'Revisa los datos enviados', errores })
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ mensaje: 'Identificador no válido' })
  }
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue ?? {})[0] ?? 'campo'
    return res.status(409).json({ mensaje: `Ya existe un registro con ese ${campo}`, errores: { [campo]: 'Valor repetido' } })
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la petición no es un JSON válido' })
  }
  console.error(err)
  res.status(500).json({ mensaje: 'Error interno del servidor' })
}
