import * as reporteService from '../services/reporteService.js'
import { asyncHandler } from '../utils/helpers.js'

export const resumen = asyncHandler(async (req, res) => {
  res.json(await reporteService.resumen())
})

export const indicadores = asyncHandler(async (req, res) => {
  res.json(await reporteService.indicadores())
})
