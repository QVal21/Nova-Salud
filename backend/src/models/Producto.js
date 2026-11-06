import mongoose from 'mongoose'
import { opcionesJSON } from '../utils/helpers.js'

const productoSchema = new mongoose.Schema(
  {
    codigo: { type: String, required: true, unique: true },
    nombre: { type: String, required: true, trim: true },
    presentacion: { type: String, required: true, trim: true },
    categoria: { type: String, required: true, trim: true },
    laboratorio: { type: String, trim: true, default: '' },
    precio: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    minimo: { type: Number, required: true, min: 0, default: 10 },
    lote: { type: String, required: true, trim: true },
    vence: { type: Date, required: true },
    receta: { type: Boolean, default: false },
    proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor' },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: opcionesJSON },
)

productoSchema.index({ nombre: 1 })
productoSchema.index({ categoria: 1 })

export default mongoose.model('Producto', productoSchema)
