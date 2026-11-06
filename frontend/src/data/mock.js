// Datos de prueba para la maqueta. Se reemplazan por llamadas a la API.

export const resumenHoy = {
  ventas: 1240.5,
  comprobantes: 38,
  tiempoPromedio: '2:40',
  totalProductos: 120,
}

export const ventasSemana = [
  { dia: 'Vie', total: 980 },
  { dia: 'Sáb', total: 1420 },
  { dia: 'Dom', total: 760 },
  { dia: 'Lun', total: 1105 },
  { dia: 'Mar', total: 1290 },
  { dia: 'Mié', total: 1180 },
  { dia: 'Hoy', total: 1240.5 },
]

export const masVendidos = [
  { nombre: 'Paracetamol 500 mg', presentacion: 'Tableta x 100', unidades: 64 },
  { nombre: 'Ibuprofeno 400 mg', presentacion: 'Tableta x 50', unidades: 48 },
  { nombre: 'Alcohol medicinal 70°', presentacion: 'Frasco 250 ml', unidades: 35 },
  { nombre: 'Loratadina 10 mg', presentacion: 'Tableta x 30', unidades: 27 },
  { nombre: 'Suero oral', presentacion: 'Sobre x 1', unidades: 22 },
]

export const stockCritico = [
  { id: 1, nombre: 'Amoxicilina 500 mg', lote: 'L-2291', tipo: 'bajo', stock: 6, minimo: 20 },
  { id: 2, nombre: 'Omeprazol 20 mg', lote: 'L-1874', tipo: 'bajo', stock: 9, minimo: 25 },
  { id: 3, nombre: 'Ibuprofeno 400 mg', lote: 'L-3310', tipo: 'vence', vence: '2026-11-28' },
  { id: 4, nombre: 'Jarabe para la tos 120 ml', lote: 'L-0957', tipo: 'vence', vence: '2026-12-02' },
  { id: 5, nombre: 'Metformina 850 mg', lote: 'L-4412', tipo: 'bajo', stock: 4, minimo: 15 },
]

export const alertasActivas = stockCritico.length
export const alertasStockBajo = stockCritico.filter((p) => p.tipo === 'bajo').length
export const alertasPorVencer = stockCritico.filter((p) => p.tipo === 'vence').length

export const soles = (n) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n)
