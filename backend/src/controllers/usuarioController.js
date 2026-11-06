import * as usuarioService from '../services/usuarioService.js'
import { asyncHandler } from '../utils/helpers.js'

export const listar = asyncHandler(async (req, res) => {
  res.json(await usuarioService.listar())
})

export const crear = asyncHandler(async (req, res) => {
  res.status(201).json(await usuarioService.crear(req.body))
})

export const actualizar = asyncHandler(async (req, res) => {
  res.json(await usuarioService.actualizar(req.params.id, req.body, req.usuario))
})
