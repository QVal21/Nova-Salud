import mongoose from 'mongoose'
import { opcionesJSON } from '../utils/helpers.js'

const itemSchema = new mongoose.Schema(
  {
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    nombre: String, // se copia el nombre y precio del momento de la venta
    presentacion: String,
    precio: Number,
    cantidad: { type: Number, required: true, min: 1 },
    subtotal: Number,
  },
  { _id: false },
)

const ventaSchema = new mongoose.Schema(
  {
    comprobante: { type: String, required: true, unique: true }, // B001-000001 / F001-000001
    tipo: { type: String, enum: ['boleta', 'factura'], required: true },
    metodo: { type: String, enum: ['efectivo', 'tarjeta', 'yape'], required: true },
    cliente: {
      ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
      nombre: String,
      documento: String,
    },
    items: { type: [itemSchema], validate: (v) => v.length > 0 },
    opGravada: Number,
    igv: Number,
    total: { type: Number, required: true },
    vendedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    vendedorNombre: String,
    duracionSegundos: Number, // tiempo de atención: para la métrica del reporte
    fecha: { type: Date, default: Date.now },
  },
  { timestamps: true, toJSON: opcionesJSON },
)

ventaSchema.index({ fecha: -1 })
ventaSchema.index({ 'cliente.ref': 1 })

export default mongoose.model('Venta', ventaSchema)
