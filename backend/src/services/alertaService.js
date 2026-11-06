import Producto from '../models/Producto.js'
import Pedido from '../models/Pedido.js'
import { diasHasta, inicioDiaLima } from '../utils/fechas.js'

export const DIAS_ALERTA_VENCE = 30

/**
 * Alertas calculadas en tiempo real desde el inventario:
 * - "bajo": stock menor o igual al mínimo del producto
 * - "vence": lote vencido o que vence en 30 días o menos
 */
export async function listar() {
  const limite = inicioDiaLima(DIAS_ALERTA_VENCE + 1)
  const productos = await Producto.find({
    activo: true,
    $or: [{ $expr: { $lte: ['$stock', '$minimo'] } }, { vence: { $lt: limite } }],
  })
    .populate('proveedor', 'razonSocial')
    .sort({ stock: 1 })

  const pendientes = new Set((await Pedido.find({ estado: 'pendiente' }).select('producto')).map((p) => String(p.producto)))

  const alertas = []
  for (const p of productos) {
    const base = p.toJSON()
    if (p.stock <= p.minimo) {
      alertas.push({
        ...base,
        tipo: 'bajo',
        sugerido: Math.max(p.minimo * 2 - p.stock, p.minimo),
        pedidoPendiente: pendientes.has(String(p._id)),
      })
    }
    const dias = diasHasta(p.vence)
    if (dias <= DIAS_ALERTA_VENCE) alertas.push({ ...base, tipo: 'vence', dias })
  }
  return alertas
}
