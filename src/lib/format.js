// Utilidades de formato y fechas.

export function formatMoneda(n) {
  const valor = Number(n) || 0
  return valor.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

// Fecha de hoy en formato YYYY-MM-DD (según hora local).
export function hoyISO() {
  const d = new Date()
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

// "2026-07-11" -> "vie 11 jul"
export function formatFechaCorta(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

// "2026-07-11" -> "viernes 11 de julio de 2026"
export function formatFechaLarga(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// "2026-07" -> "julio 2026"
export function formatMes(mesISO) {
  const d = new Date(mesISO + '-01T00:00:00')
  return d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}

export function mesActualISO() {
  return hoyISO().slice(0, 7)
}

// Etiquetas de dominio
export const MODALIDADES_PAGO = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  ctacte: 'Cuenta corriente',
}

export const CATEGORIAS_EGRESO = {
  seguro: 'Seguro',
  combustible: 'Combustible',
  insumos: 'Insumos',
  otro: 'Otro',
}
