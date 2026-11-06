import jwt from 'jsonwebtoken'
import AppError from '../utils/AppError.js'

// Verifica el token JWT enviado como "Authorization: Bearer <token>"
export function verificarToken(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ')
  if (tipo !== 'Bearer' || !token) return next(new AppError(401, 'Inicia sesión para continuar'))
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET) // { id, nombre, rol }
    next()
  } catch {
    next(new AppError(401, 'Tu sesión expiró. Vuelve a iniciar sesión'))
  }
}

// Restringe una ruta a ciertos roles: permitirRoles('admin')
export const permitirRoles =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.usuario?.rol) ? next() : next(new AppError(403, 'No tienes permiso para esta acción'))
