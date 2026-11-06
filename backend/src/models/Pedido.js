import mongoose from 'mongoose'
import { opcionesJSON } from '../utils/helpers.js'

// Pedido de reposición generado desde una alerta de stock bajo
const pedidoSchema = new mongoose.Schema(
  {
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor', required: true },
    cantidad: { type: Number, required: true, min: 1 },
    estado: { type: String, enum: ['pendiente', 'recibido'], default: 'pendiente' },
    creadoPor: String,
    fecha: { type: Date, default: Date.now },
    recibidoEn: Date,
  },
  { timestamps: true, toJSON: opcionesJSON },
)

export default mongoose.model('Pedido', pedidoSchema)
