import * as authService from '../services/authService.js'
import { asyncHandler } from '../utils/helpers.js'

export const login = asyncHandler(async (req, res) => {
  res.json(await authService.login(req.body))
})

export const perfil = asyncHandler(async (req, res) => {
  res.json(await authService.perfil(req.usuario.id))
})
