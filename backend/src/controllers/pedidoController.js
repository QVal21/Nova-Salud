import * as pedidoService from '../services/pedidoService.js'
import { asyncHandler } from '../utils/helpers.js'

export const listar = asyncHandler(async (req, res) => {
  res.json(await pedidoService.listar())
})

export const generar = asyncHandler(async (req, res) => {
  res.status(201).json(await pedidoService.generar(req.body, req.usuario))
})

export const recibir = asyncHandler(async (req, res) => {
  res.json(await pedidoService.recibir(req.params.id, req.usuario))
})
