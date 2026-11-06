// Datos de prueba para la maqueta. Se reemplazan por llamadas a la API.
import { enDias, haceHoras } from '../utils/format'

export const proveedores = [
  { id: 1, ruc: '20512345671', razonSocial: 'Distribuidora Farmacéutica del Sur S.A.C.', contacto: 'Rosa Medina', telefono: '954321876', email: 'pedidos@difarsur.pe' },
  { id: 2, ruc: '20498765432', razonSocial: 'Droguería Andina E.I.R.L.', contacto: 'Luis Paredes', telefono: '959112233', email: 'ventas@drogueriaandina.pe' },
  { id: 3, ruc: '20601122334', razonSocial: 'Insumos Médicos Arequipa S.A.', contacto: 'Carla Núñez', telefono: '958445566', email: 'contacto@imaqp.pe' },
]

export const productos = [
  { id: 1, codigo: 'P0001', nombre: 'Paracetamol 500 mg', presentacion: 'Tableta x 100', categoria: 'Analgésicos', laboratorio: 'Genfar', precio: 8.5, stock: 140, minimo: 40, lote: 'L-2201', vence: enDias(410), receta: false, proveedorId: 1 },
  { id: 2, codigo: 'P0002', nombre: 'Ibuprofeno 400 mg', presentacion: 'Tableta x 50', categoria: 'Analgésicos', laboratorio: 'Portugal', precio: 12, stock: 62, minimo: 30, lote: 'L-3310', vence: enDias(22), receta: false, proveedorId: 1 },
  { id: 3, codigo: 'P0003', nombre: 'Naproxeno 550 mg', presentacion: 'Tableta x 10', categoria: 'Analgésicos', laboratorio: 'Medifarma', precio: 9.9, stock: 45, minimo: 15, lote: 'L-1180', vence: enDias(300), receta: false, proveedorId: 2 },
  { id: 4, codigo: 'P0004', nombre: 'Amoxicilina 500 mg', presentacion: 'Cápsula x 100', categoria: 'Antibióticos', laboratorio: 'Genfar', precio: 28, stock: 6, minimo: 20, lote: 'L-2291', vence: enDias(250), receta: true, proveedorId: 1 },
  { id: 5, codigo: 'P0005', nombre: 'Azitromicina 500 mg', presentacion: 'Tableta x 3', categoria: 'Antibióticos', laboratorio: 'AC Farma', precio: 15.5, stock: 24, minimo: 10, lote: 'L-0412', vence: enDias(380), receta: true, proveedorId: 2 },
  { id: 6, codigo: 'P0006', nombre: 'Loratadina 10 mg', presentacion: 'Tableta x 30', categoria: 'Antialérgicos', laboratorio: 'Portugal', precio: 6.5, stock: 88, minimo: 25, lote: 'L-7720', vence: enDias(520), receta: false, proveedorId: 1 },
  { id: 7, codigo: 'P0007', nombre: 'Cetirizina 10 mg', presentacion: 'Tableta x 20', categoria: 'Antialérgicos', laboratorio: 'Medifarma', precio: 7.2, stock: 0, minimo: 15, lote: 'L-7015', vence: enDias(200), receta: false, proveedorId: 2 },
  { id: 8, codigo: 'P0008', nombre: 'Omeprazol 20 mg', presentacion: 'Cápsula x 30', categoria: 'Gastrointestinal', laboratorio: 'Genfar', precio: 10, stock: 9, minimo: 25, lote: 'L-1874', vence: enDias(330), receta: false, proveedorId: 1 },
  { id: 9, codigo: 'P0009', nombre: 'Suero oral', presentacion: 'Sobre x 1', categoria: 'Gastrointestinal', laboratorio: 'Electrolife', precio: 2.5, stock: 150, minimo: 50, lote: 'L-5521', vence: enDias(600), receta: false, proveedorId: 3 },
  { id: 10, codigo: 'P0010', nombre: 'Metformina 850 mg', presentacion: 'Tableta x 30', categoria: 'Diabetes', laboratorio: 'AC Farma', precio: 11, stock: 4, minimo: 15, lote: 'L-4412', vence: enDias(280), receta: true, proveedorId: 2 },
  { id: 11, codigo: 'P0011', nombre: 'Jarabe para la tos', presentacion: 'Frasco 120 ml', categoria: 'Respiratorio', laboratorio: 'Teraflu', precio: 18.9, stock: 30, minimo: 10, lote: 'L-0957', vence: enDias(26), receta: false, proveedorId: 2 },
  { id: 12, codigo: 'P0012', nombre: 'Salbutamol inhalador', presentacion: 'Frasco 200 dosis', categoria: 'Respiratorio', laboratorio: 'Medifarma', precio: 24, stock: 14, minimo: 8, lote: 'L-3008', vence: enDias(450), receta: true, proveedorId: 2 },
  { id: 13, codigo: 'P0013', nombre: 'Vitamina C 1 g', presentacion: 'Tableta efervescente x 10', categoria: 'Vitaminas', laboratorio: 'Redoxon', precio: 16, stock: 40, minimo: 12, lote: 'L-6600', vence: enDias(-3), receta: false, proveedorId: 1 },
  { id: 14, codigo: 'P0014', nombre: 'Alcohol medicinal 70°', presentacion: 'Frasco 250 ml', categoria: 'Primeros auxilios', laboratorio: 'Alkofarma', precio: 4.5, stock: 70, minimo: 20, lote: 'L-8801', vence: enDias(700), receta: false, proveedorId: 3 },
  { id: 15, codigo: 'P0015', nombre: 'Gasa estéril 10 x 10', presentacion: 'Sobre x 5', categoria: 'Primeros auxilios', laboratorio: 'Medical Care', precio: 3, stock: 95, minimo: 30, lote: 'L-8820', vence: enDias(900), receta: false, proveedorId: 3 },
  { id: 16, codigo: 'P0016', nombre: 'Bloqueador solar FPS 50', presentacion: 'Tubo 120 ml', categoria: 'Cuidado personal', laboratorio: 'Eucerin', precio: 59.9, stock: 18, minimo: 6, lote: 'L-9100', vence: enDias(480), receta: false, proveedorId: 3 },
]

export const clientes = [
  { id: 1, dni: '45871236', nombre: 'María Fernanda Ccori', telefono: '987654321', email: 'mfccori@gmail.com' },
  { id: 2, dni: '70214589', nombre: 'José Luis Mamani', telefono: '956123478', email: '' },
  { id: 3, dni: '41236985', nombre: 'Rosa Elena Huamán', telefono: '974512369', email: 'rosa.huaman@hotmail.com' },
  { id: 4, dni: '72589641', nombre: 'Carlos Alberto Apaza', telefono: '', email: '' },
]

const item = (id, cantidad) => {
  const p = productos.find((x) => x.id === id)
  return { id, nombre: p.nombre, presentacion: p.presentacion, precio: p.precio, cantidad }
}
const cli = (id) => {
  const c = clientes.find((x) => x.id === id)
  return { id: c.id, nombre: c.nombre, dni: c.dni }
}
const venta = (n, horas, tipo, metodo, vendedor, cliente, items) => ({
  id: n,
  comprobante: `${tipo === 'factura' ? 'F001' : 'B001'}-${String(n).padStart(6, '0')}`,
  fecha: haceHoras(horas),
  tipo,
  metodo,
  vendedor,
  cliente,
  items,
  total: items.reduce((s, i) => s + i.precio * i.cantidad, 0),
})

export const ventas = [
  venta(318, 0.4, 'boleta', 'efectivo', 'Ana Torres', null, [item(1, 2), item(9, 3)]),
  venta(317, 1.1, 'boleta', 'yape', 'Ana Torres', cli(1), [item(6, 1), item(13, 1)]),
  venta(316, 2.3, 'boleta', 'tarjeta', 'Ana Torres', cli(3), [item(4, 1), item(2, 1)]),
  venta(315, 3.5, 'boleta', 'efectivo', 'Ana Torres', null, [item(14, 2), item(15, 4)]),
  venta(314, 5, 'factura', 'tarjeta', 'Ana Torres', null, [item(16, 2), item(11, 1)]),
  venta(313, 26, 'boleta', 'efectivo', 'Ana Torres', cli(2), [item(10, 2), item(1, 1)]),
  venta(312, 29, 'boleta', 'yape', 'Ana Torres', null, [item(8, 2)]),
  venta(311, 50, 'boleta', 'efectivo', 'Ana Torres', cli(1), [item(5, 1), item(9, 2)]),
  venta(310, 75, 'boleta', 'tarjeta', 'Ana Torres', cli(4), [item(12, 1), item(2, 2)]),
]

export const movimientos = [
  { id: 1, fecha: haceHoras(4), tipo: 'entrada', productoId: 1, cantidad: 60, stockFinal: 140, motivo: 'Compra a proveedor', usuario: 'Administrador' },
  { id: 2, fecha: haceHoras(20), tipo: 'ajuste', productoId: 8, cantidad: -2, stockFinal: 9, motivo: 'Conteo físico', usuario: 'Administrador' },
  { id: 3, fecha: haceHoras(30), tipo: 'salida', productoId: 7, cantidad: -3, stockFinal: 0, motivo: 'Producto dañado', usuario: 'Ana Torres' },
  { id: 4, fecha: haceHoras(52), tipo: 'entrada', productoId: 9, cantidad: 100, stockFinal: 150, motivo: 'Compra a proveedor', usuario: 'Administrador' },
]

export const pedidos = [
  { id: 1, fecha: haceHoras(24), productoId: 7, proveedorId: 2, cantidad: 30, estado: 'pendiente' },
]

export const usuarios = [
  { id: 1, nombre: 'Administrador', usuario: 'admin', rol: 'admin', activo: true },
  { id: 2, nombre: 'Ana Torres', usuario: 'ana.torres', rol: 'vendedor', activo: true },
  { id: 3, nombre: 'Pedro Quispe', usuario: 'pedro.quispe', rol: 'vendedor', activo: false },
]

// Datos de apoyo para el panel y reportes
export const tiempoPromedioAtencion = '2:40'

export const ventasSemanaBase = [
  { dia: 'Hace 6 d', total: 980 },
  { dia: 'Hace 5 d', total: 1420 },
  { dia: 'Hace 4 d', total: 760 },
  { dia: 'Hace 3 d', total: 1105 },
  { dia: 'Hace 2 d', total: 1290 },
  { dia: 'Ayer', total: 1180 },
]

export const ventasPorHora = [
  { hora: '8 h', total: 120 },
  { hora: '9 h', total: 210 },
  { hora: '10 h', total: 340 },
  { hora: '11 h', total: 290 },
  { hora: '12 h', total: 180 },
  { hora: '13 h', total: 150 },
  { hora: '14 h', total: 220 },
  { hora: '15 h', total: 260 },
  { hora: '16 h', total: 310 },
  { hora: '17 h', total: 380 },
  { hora: '18 h', total: 420 },
  { hora: '19 h', total: 360 },
  { hora: '20 h', total: 190 },
]
