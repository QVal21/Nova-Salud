import mongoose from 'mongoose'
import { opcionesJSON } from '../utils/helpers.js'

const proveedorSchema = new mongoose.Schema(
  {
    ruc: { type: String, required: true, unique: true, match: /^(10|20)\d{9}$/ },
    razonSocial: { type: String, required: true, trim: true },
    contacto: { type: String, trim: true, default: '' },
    telefono: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
  },
  { timestamps: true, toJSON: opcionesJSON },
)

export default mongoose.model('Proveedor', proveedorSchema)
