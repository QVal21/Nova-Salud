import mongoose from 'mongoose'
import { opcionesJSON } from '../utils/helpers.js'

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    usuario: { type: String, required: true, unique: true, lowercase: true, trim: true },
    clave: { type: String, required: true, select: false }, // hash bcrypt, nunca se devuelve
    rol: { type: String, enum: ['admin', 'vendedor'], default: 'vendedor' },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: opcionesJSON },
)

export default mongoose.model('Usuario', usuarioSchema)
