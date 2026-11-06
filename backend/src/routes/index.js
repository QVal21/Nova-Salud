import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { verificarToken, permitirRoles } from '../middlewares/auth.js'
import * as auth from '../controllers/authController.js'
import * as usuarios from '../controllers/usuarioController.js'
import * as productos from '../controllers/productoController.js'
import * as ventas from '../controllers/ventaController.js'
import * as movimientos from '../controllers/movimientoController.js'
import * as clientes from '../controllers/clienteController.js'
import * as proveedores from '../controllers/proveedorController.js'
import * as alertas from '../controllers/alertaController.js'
import * as pedidos from '../controllers/pedidoController.js'
import * as reportes from '../controllers/reporteController.js'

const router = Router()
const soloAdmin = permitirRoles('admin')

// Máximo 10 intentos de login cada 15 minutos por IP (frena ataques de fuerza bruta)
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensaje: 'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo' },
})

// ---- Públicas
router.post('/auth/login', limiteLogin, auth.login)

// ---- Desde aquí todas requieren token
router.use(verificarToken)

router.get('/auth/perfil', auth.perfil)

router.get('/usuarios', soloAdmin, usuarios.listar)
router.post('/usuarios', soloAdmin, usuarios.crear)
router.patch('/usuarios/:id', soloAdmin, usuarios.actualizar)

router.get('/productos', productos.listar)
router.get('/productos/categorias', productos.categorias)
router.get('/productos/:id', productos.obtener)
router.post('/productos', soloAdmin, productos.crear)
router.put('/productos/:id', soloAdmin, productos.actualizar)
router.delete('/productos/:id', soloAdmin, productos.eliminar)

router.get('/ventas', ventas.listar)
router.get('/ventas/:id', ventas.obtener)
router.post('/ventas', ventas.registrar)

router.get('/movimientos', movimientos.listar)
router.post('/movimientos', movimientos.registrar)

router.get('/clientes', clientes.listar)
router.post('/clientes', clientes.crear)
router.put('/clientes/:id', clientes.actualizar)
router.get('/clientes/:id/compras', clientes.compras)

router.get('/proveedores', proveedores.listar)
router.post('/proveedores', soloAdmin, proveedores.crear)
router.put('/proveedores/:id', soloAdmin, proveedores.actualizar)

router.get('/alertas', alertas.listar)

router.get('/pedidos', pedidos.listar)
router.post('/pedidos', pedidos.generar)
router.patch('/pedidos/:id/recibir', soloAdmin, pedidos.recibir)

router.get('/reportes/resumen', reportes.resumen)
router.get('/reportes/indicadores', soloAdmin, reportes.indicadores)

export default router
