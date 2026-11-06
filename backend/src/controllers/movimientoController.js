import * as movimientoService from '../services/movimientoService.js'
import { asyncHandler } from '../utils/helpers.js'

export const listar = asyncHandler(async (req, res) => {
  res.json(await movimientoService.listar(req.query))
})

export const registrar = asyncHandler(async (req, res) => {
  res.status(201).json(await movimientoService.registrar(req.body, req.usuario))
})
