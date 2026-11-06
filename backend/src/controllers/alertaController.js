import * as alertaService from '../services/alertaService.js'
import { asyncHandler } from '../utils/helpers.js'

export const listar = asyncHandler(async (req, res) => {
  res.json(await alertaService.listar())
})
