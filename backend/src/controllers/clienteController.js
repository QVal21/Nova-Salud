import * as clienteService from '../services/clienteService.js'
import { asyncHandler } from '../utils/helpers.js'

export const listar = asyncHandler(async (req, res) => {
  res.json(await clienteService.listar(req.query))
})

export const crear = asyncHandler(async (req, res) => {
  res.status(201).json(await clienteService.crear(req.body))
})

export const actualizar = asyncHandler(async (req, res) => {
  res.json(await clienteService.actualizar(req.params.id, req.body))
})

export const compras = asyncHandler(async (req, res) => {
  res.json(await clienteService.compras(req.params.id))
})
