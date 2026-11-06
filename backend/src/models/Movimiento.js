import mongoose from 'mongoose'
import { opcionesJSON } from '../utils/helpers.js'

// Kardex: cada cambio de stock queda registrado con quién, cuándo y por qué
const movimientoSchema = new mongoose.Schema(
  {
    tipo: { type: String, enum: ['entrada', 'salida', 'ajuste'], required: true },
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    productoNombre: String,
    cantidad: { type: Number, required: true }, // positivo suma, negativo resta
    stockFinal: { type: Number, required: true },
    motivo: { type: String, required: true, trim: true },
    referencia: { type: mongoose.Schema.Types.ObjectId }, // venta o pedido que lo originó
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    usuarioNombre: String,
    fecha: { type: Date, default: Date.now },
  },
  { timestamps: true, toJSON: opcionesJSON },
)

movimientoSchema.index({ fecha: -1 })
movimientoSchema.index({ producto: 1 })

export default mongoose.model('Movimiento', movimientoSchema)
