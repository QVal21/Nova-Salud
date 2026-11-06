import mongoose from 'mongoose'

// Correlativos: B001, F001 (comprobantes) y producto (códigos P0001...)
const contadorSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
})

const Contador = mongoose.model('Contador', contadorSchema)

export async function siguiente(nombre, session) {
  const c = await Contador.findByIdAndUpdate(nombre, { $inc: { seq: 1 } }, { new: true, upsert: true, session })
  return c.seq
}

export default Contador
