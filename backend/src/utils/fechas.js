// Perú usa UTC-5 todo el año (sin horario de verano)
const OFFSET_LIMA = 5 * 3600000
export const ZONA = 'America/Lima'

// Medianoche de Lima desplazada n días respecto a hoy, como Date en UTC
export function inicioDiaLima(dias = 0) {
  const lima = new Date(Date.now() - OFFSET_LIMA)
  return new Date(Date.UTC(lima.getUTCFullYear(), lima.getUTCMonth(), lima.getUTCDate() + dias, 5))
}

// Convierte "AAAA-MM-DD" en la medianoche de Lima de ese día
export function fechaLima(valor) {
  if (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor)) return new Date(`${valor}T05:00:00.000Z`)
  return new Date(valor)
}

export const diasHasta = (fecha) => Math.round((new Date(fecha) - inicioDiaLima(0)) / 86400000)
