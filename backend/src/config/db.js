import mongoose from 'mongoose'

export async function conectarDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('Falta MONGODB_URI en el archivo .env')
    process.exit(1)
  }
  try {
    await mongoose.connect(uri)
    console.log(`MongoDB conectado: ${mongoose.connection.name}`)
  } catch (error) {
    console.error('No se pudo conectar a MongoDB:', error.message)
    process.exit(1)
  }
}
