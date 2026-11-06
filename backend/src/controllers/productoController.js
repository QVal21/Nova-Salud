import * as productoService from '../services/productoService.js'
import { asyncHandler } from '../utils/helpers.js'

export const listar = asyncHandler(async (req, res) => {
  res.json(await productoService.listar(req.query))
})

export const categorias = asyncHandler(async (req, res) => {
  res.json(await productoService.categorias())
})

export const obtener = asyncHandler(async (req, res) => {
  res.json(await productoService.obtener(req.params.id))
})

export const crear = asyncHandler(async (req, res) => {
  res.status(201).json(await productoService.crear(req.body, req.usuario))
})

export const actualizar = asyncHandler(async (req, res) => {
  res.json(await productoService.actualizar(req.params.id, req.body))
})

export const eliminar = asyncHandler(async (req, res) => {
  await productoService.eliminar(req.params.id)
  res.status(204).end()
})
