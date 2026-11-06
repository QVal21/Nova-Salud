import 'dotenv/config'
import app from './src/app.js'
import { conectarDB } from './src/config/db.js'

const PORT = process.env.PORT || 4000

if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en el archivo .env')
  process.exit(1)
}

await conectarDB()

app.listen(PORT, () => {
  console.log(`API Nova Salud escuchando en http://localhost:${PORT}`)
})
