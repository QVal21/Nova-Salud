import * as ventaService from '../services/ventaService.js'
import { asyncHandler } from '../utils/helpers.js'

export const listar = asyncHandler(async (req, res) => {
  res.json(await ventaService.listar(req.query))
})

export const obtener = asyncHandler(async (req, res) => {
  res.json(await ventaService.obtener(req.params.id))
})

export const registrar = asyncHandler(async (req, res) => {
  res.status(201).json(await ventaService.registrar(req.body, req.usuario))
})
