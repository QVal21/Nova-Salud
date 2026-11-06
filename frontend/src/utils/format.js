export const soles = (n) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n)

const aFecha = (iso) => new Date(iso.length === 10 ? `${iso}T00:00:00` : iso)

export const fechaCorta = (iso) =>
  aFecha(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })

export const fechaHora = (iso) =>
  aFecha(iso).toLocaleString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export const esHoy = (iso) => aFecha(iso).toDateString() === new Date().toDateString()

export const diasDesde = (iso) => Math.floor((Date.now() - aFecha(iso).getTime()) / 86400000)

export const diasHasta = (iso) => {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return Math.round((aFecha(iso) - hoy) / 86400000)
}

// Fecha local en formato AAAA-MM-DD, desplazada n días desde hoy
export const enDias = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  const p = (x) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export const haceHoras = (h) => new Date(Date.now() - h * 3600000).toISOString()

// 160 -> "2:40 min"
export const duracion = (seg) =>
  seg == null ? '—' : `${Math.floor(seg / 60)}:${String(Math.round(seg % 60)).padStart(2, '0')} min`

// Para búsquedas sin importar tildes ni mayúsculas
export const normalizar = (s) =>
  (s ?? '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
