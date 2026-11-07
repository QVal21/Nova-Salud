import mongoose from 'mongoose'
import { opcionesJSON } from '../utils/helpers.js'

const clienteSchema = new mongoose.Schema(
  {
    dni: { type: String, required: true, unique: true, match: /^\d{8}$/ },
    nombre: { type: String, required: true, trim: true },
    telefono: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    consentimientoFecha: { type: Date }, // cuándo autorizó el tratamiento de sus datos (Ley N.° 29733); opcional en clientes antiguos
  },
  { timestamps: true, toJSON: opcionesJSON },
)

export default mongoose.model('Cliente', clienteSchema)
