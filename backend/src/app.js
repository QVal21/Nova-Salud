import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rutas from './routes/index.js'
import { manejarErrores, rutaNoEncontrada } from './middlewares/errores.js'

const app = express()
app.set('trust proxy', 1) // en Render la app corre detrás de un proxy; necesario para el límite de intentos

const origenes = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

app.use(helmet()) // cabeceras de seguridad HTTP
app.use(cors({ origin: origenes }))
app.use(express.json({ limit: '100kb' }))
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'))

app.get('/api/health', (req, res) => res.json({ ok: true, servicio: 'Nova Salud API' }))
app.use('/api', rutas)

app.use(rutaNoEncontrada)
app.use(manejarErrores)

export default app
