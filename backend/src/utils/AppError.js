// Error controlado: lleva el código HTTP y, opcionalmente, los errores por campo
export default class AppError extends Error {
  constructor(status, mensaje, errores) {
    super(mensaje)
    this.status = status
    this.errores = errores
  }
}
