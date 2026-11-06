import * as proveedorService from '../services/proveedorService.js'
import { asyncHandler } from '../utils/helpers.js'

export const listar = asyncHandler(async (req, res) => {
  res.json(await proveedorService.listar())
})

export const crear = asyncHandler(async (req, res) => {
  res.status(201).json(await proveedorService.crear(req.body))
})

export const actualizar = asyncHandler(async (req, res) => {
  res.json(await proveedorService.actualizar(req.params.id, req.body))
})
