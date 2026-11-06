// Carga datos de prueba. BORRA todo lo que haya en la base. Uso: npm run seed
import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { conectarDB } from './src/config/db.js'
import Usuario from './src/models/Usuario.js'
import Proveedor from './src/models/Proveedor.js'
import Producto from './src/models/Producto.js'
import Cliente from './src/models/Cliente.js'
import Venta from './src/models/Venta.js'
import Movimiento from './src/models/Movimiento.js'
import Pedido from './src/models/Pedido.js'
import Contador from './src/models/Contador.js'
import { inicioDiaLima } from './src/utils/fechas.js'
import { redondear } from './src/utils/helpers.js'

const haceHoras = (h) => new Date(Date.now() - h * 3600000)

await conectarDB()

await Promise.all([Usuario, Proveedor, Producto, Cliente, Venta, Movimiento, Pedido, Contador].map((m) => m.deleteMany({})))

// ---- Usuarios
const [admin, ana] = await Usuario.create([
  { nombre: 'Administrador', usuario: 'admin', rol: 'admin', clave: await bcrypt.hash('admin123', 10) },
  { nombre: 'Ana Torres', usuario: 'ana.torres', rol: 'vendedor', clave: await bcrypt.hash('vendedor123', 10) },
  { nombre: 'Pedro Quispe', usuario: 'pedro.quispe', rol: 'vendedor', activo: false, clave: await bcrypt.hash('vendedor123', 10) },
])

// ---- Proveedores
const provs = await Proveedor.create([
  { ruc: '20512345671', razonSocial: 'Distribuidora Farmacéutica del Sur S.A.C.', contacto: 'Rosa Medina', telefono: '954321876', email: 'pedidos@difarsur.pe' },
  { ruc: '20498765432', razonSocial: 'Droguería Andina E.I.R.L.', contacto: 'Luis Paredes', telefono: '959112233', email: 'ventas@drogueriaandina.pe' },
  { ruc: '20601122334', razonSocial: 'Insumos Médicos Arequipa S.A.', contacto: 'Carla Núñez', telefono: '958445566', email: 'contacto@imaqp.pe' },
])

// ---- Productos (vencimientos relativos a hoy para que siempre haya alertas de prueba)
const base = [
  ['Paracetamol 500 mg', 'Tableta x 100', 'Analgésicos', 'Genfar', 8.5, 140, 40, 'L-2201', 410, false, 0],
  ['Ibuprofeno 400 mg', 'Tableta x 50', 'Analgésicos', 'Portugal', 12, 62, 30, 'L-3310', 22, false, 0],
  ['Naproxeno 550 mg', 'Tableta x 10', 'Analgésicos', 'Medifarma', 9.9, 45, 15, 'L-1180', 300, false, 1],
  ['Amoxicilina 500 mg', 'Cápsula x 100', 'Antibióticos', 'Genfar', 28, 6, 20, 'L-2291', 250, true, 0],
  ['Azitromicina 500 mg', 'Tableta x 3', 'Antibióticos', 'AC Farma', 15.5, 24, 10, 'L-0412', 380, true, 1],
  ['Loratadina 10 mg', 'Tableta x 30', 'Antialérgicos', 'Portugal', 6.5, 88, 25, 'L-7720', 520, false, 0],
  ['Cetirizina 10 mg', 'Tableta x 20', 'Antialérgicos', 'Medifarma', 7.2, 0, 15, 'L-7015', 200, false, 1],
  ['Omeprazol 20 mg', 'Cápsula x 30', 'Gastrointestinal', 'Genfar', 10, 9, 25, 'L-1874', 330, false, 0],
  ['Suero oral', 'Sobre x 1', 'Gastrointestinal', 'Electrolife', 2.5, 150, 50, 'L-5521', 600, false, 2],
  ['Metformina 850 mg', 'Tableta x 30', 'Diabetes', 'AC Farma', 11, 4, 15, 'L-4412', 280, true, 1],
  ['Jarabe para la tos', 'Frasco 120 ml', 'Respiratorio', 'Teraflu', 18.9, 30, 10, 'L-0957', 26, false, 1],
  ['Salbutamol inhalador', 'Frasco 200 dosis', 'Respiratorio', 'Medifarma', 24, 14, 8, 'L-3008', 450, true, 1],
  ['Vitamina C 1 g', 'Tableta efervescente x 10', 'Vitaminas', 'Redoxon', 16, 40, 12, 'L-6600', -3, false, 0],
  ['Alcohol medicinal 70°', 'Frasco 250 ml', 'Primeros auxilios', 'Alkofarma', 4.5, 70, 20, 'L-8801', 700, false, 2],
  ['Gasa estéril 10 x 10', 'Sobre x 5', 'Primeros auxilios', 'Medical Care', 3, 95, 30, 'L-8820', 900, false, 2],
  ['Bloqueador solar FPS 50', 'Tubo 120 ml', 'Cuidado personal', 'Eucerin', 59.9, 18, 6, 'L-9100', 480, false, 2],
]
const productos = await Producto.create(
  base.map(([nombre, presentacion, categoria, laboratorio, precio, stock, minimo, lote, dias, receta, prov], i) => ({
    codigo: `P${String(i + 1).padStart(4, '0')}`,
    nombre, presentacion, categoria, laboratorio, precio, stock, minimo, lote, receta,
    vence: inicioDiaLima(dias),
    proveedor: provs[prov]._id,
  })),
)
const P = (n) => productos[n - 1]

// ---- Clientes
const clientes = await Cliente.create([
  { dni: '45871236', nombre: 'María Fernanda Ccori', telefono: '987654321', email: 'mfccori@gmail.com' },
  { dni: '70214589', nombre: 'José Luis Mamani', telefono: '956123478' },
  { dni: '41236985', nombre: 'Rosa Elena Huamán', telefono: '974512369', email: 'rosa.huaman@hotmail.com' },
  { dni: '72589641', nombre: 'Carlos Alberto Apaza' },
])

// ---- Ventas de los últimos días (historial; el stock de arriba ya es el actual)
const venta = (n, horas, tipo, metodo, cliente, items, duracion) => {
  const detalle = items.map(([pn, cantidad]) => {
    const p = P(pn)
    return { producto: p._id, nombre: p.nombre, presentacion: p.presentacion, precio: p.precio, cantidad, subtotal: redondear(p.precio * cantidad) }
  })
  const total = redondear(detalle.reduce((s, i) => s + i.subtotal, 0))
  return {
    comprobante: `${tipo === 'factura' ? 'F001' : 'B001'}-${String(n).padStart(6, '0')}`,
    tipo, metodo, items: detalle, total,
    opGravada: redondear(total / 1.18),
    igv: redondear(total - total / 1.18),
    cliente: cliente ? { ref: cliente._id, nombre: cliente.nombre, documento: cliente.dni } : cliente === null ? undefined : { nombre: 'RUC 20512345671', documento: '20512345671' },
    vendedor: ana._id, vendedorNombre: ana.nombre,
    duracionSegundos: duracion,
    fecha: haceHoras(horas),
  }
}
await Venta.create([
  venta(8, 0.4, 'boleta', 'efectivo', null, [[1, 2], [9, 3]], 140),
  venta(7, 1.1, 'boleta', 'yape', clientes[0], [[6, 1], [13, 1]], 175),
  venta(6, 2.3, 'boleta', 'tarjeta', clientes[2], [[4, 1], [2, 1]], 190),
  venta(5, 3.5, 'boleta', 'efectivo', null, [[14, 2], [15, 4]], 120),
  venta(1, 5, 'factura', 'tarjeta', undefined, [[16, 2], [11, 1]], 210),
  venta(4, 26, 'boleta', 'efectivo', clientes[1], [[10, 2], [1, 1]], 165),
  venta(3, 29, 'boleta', 'yape', null, [[8, 2]], 130),
  venta(2, 50, 'boleta', 'efectivo', clientes[0], [[5, 1], [9, 2]], 150),
  venta(1, 75, 'boleta', 'tarjeta', clientes[3], [[12, 1], [2, 2]], 185),
])

// ---- Movimientos
await Movimiento.create([
  { tipo: 'entrada', producto: P(1)._id, productoNombre: P(1).nombre, cantidad: 60, stockFinal: 140, motivo: 'Compra a proveedor', usuario: admin._id, usuarioNombre: admin.nombre, fecha: haceHoras(4) },
  { tipo: 'ajuste', producto: P(8)._id, productoNombre: P(8).nombre, cantidad: -2, stockFinal: 9, motivo: 'Conteo físico', usuario: admin._id, usuarioNombre: admin.nombre, fecha: haceHoras(20) },
  { tipo: 'salida', producto: P(7)._id, productoNombre: P(7).nombre, cantidad: -3, stockFinal: 0, motivo: 'Producto dañado', usuario: ana._id, usuarioNombre: ana.nombre, fecha: haceHoras(30) },
  { tipo: 'entrada', producto: P(9)._id, productoNombre: P(9).nombre, cantidad: 100, stockFinal: 150, motivo: 'Compra a proveedor', usuario: admin._id, usuarioNombre: admin.nombre, fecha: haceHoras(52) },
])

// ---- Pedido pendiente
await Pedido.create({ producto: P(7)._id, proveedor: provs[1]._id, cantidad: 30, creadoPor: admin.nombre, fecha: haceHoras(24) })

// ---- Correlativos para que la próxima venta siga la numeración
await Contador.create([
  { _id: 'B001', seq: 8 },
  { _id: 'F001', seq: 1 },
  { _id: 'producto', seq: productos.length },
])

console.log('Datos de prueba cargados.')
console.log('  admin / admin123        (administrador)')
console.log('  ana.torres / vendedor123 (vendedor)')
await mongoose.disconnect()
