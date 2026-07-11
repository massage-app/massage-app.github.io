import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import { Modal, Boton, Campo, Input, Select, Vacio } from '../components/ui.jsx'
import {
  formatMoneda,
  formatFechaCorta,
  hoyISO,
  mesActualISO,
  formatMes,
  MODALIDADES_PAGO,
  CATEGORIAS_EGRESO,
} from '../lib/format.js'

const ETIQUETA_CAT = { ...MODALIDADES_PAGO, ...CATEGORIAS_EGRESO }

export default function Caja() {
  const { movimientos, eliminarMovimiento } = useData()
  const [egreso, setEgreso] = useState(false)
  const [mes, setMes] = useState(mesActualISO())

  // Movimientos del mes seleccionado
  const delMes = useMemo(
    () => movimientos.filter((m) => m.fecha.startsWith(mes)),
    [movimientos, mes],
  )

  const resumen = useMemo(() => {
    let ingresos = 0
    let egresos = 0
    const porCategoria = {}
    for (const m of delMes) {
      if (m.tipo === 'ingreso') ingresos += m.monto
      else egresos += m.monto
      const clave = `${m.tipo}:${m.categoria}`
      porCategoria[clave] = (porCategoria[clave] || 0) + m.monto
    }
    return { ingresos, egresos, neto: ingresos - egresos, porCategoria }
  }, [delMes])

  const delDia = useMemo(
    () => movimientos.filter((m) => m.fecha === hoyISO()),
    [movimientos],
  )
  const totalDia = delDia
    .filter((m) => m.tipo === 'ingreso')
    .reduce((s, m) => s + m.monto, 0)

  // Meses disponibles para el selector
  const meses = useMemo(() => {
    const set = new Set(movimientos.map((m) => m.fecha.slice(0, 7)))
    set.add(mesActualISO())
    return [...set].sort().reverse()
  }, [movimientos])

  const ordenadosMes = [...delMes].sort((a, b) =>
    (b.fecha + b.createdAt).localeCompare(a.fecha + a.createdAt),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-verde-900">Caja</h2>
        <Boton onClick={() => setEgreso(true)}>+ Egreso</Boton>
      </div>

      {/* Caja del día */}
      <div className="rounded-2xl bg-verde-700 p-4 text-white">
        <p className="text-sm text-verde-100">Ingresos de hoy</p>
        <p className="text-3xl font-bold">{formatMoneda(totalDia)}</p>
        <p className="mt-1 text-xs text-verde-100">
          {delDia.length} movimiento{delDia.length === 1 ? '' : 's'} en el día
        </p>
      </div>

      {/* Reporte mensual */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-verde-900">Reporte mensual</h3>
          <Select value={mes} onChange={(e) => setMes(e.target.value)} >
            {meses.map((m) => (
              <option key={m} value={m}>{formatMes(m)}</option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-verde-50 p-3">
            <p className="text-xs text-verde-700">Ingresos</p>
            <p className="font-bold text-verde-900">{formatMoneda(resumen.ingresos)}</p>
          </div>
          <div className="rounded-xl bg-red-50 p-3">
            <p className="text-xs text-red-700">Egresos</p>
            <p className="font-bold text-red-700">{formatMoneda(resumen.egresos)}</p>
          </div>
          <div className="rounded-xl bg-verde-100 p-3">
            <p className="text-xs text-verde-700">Neto</p>
            <p className="font-bold text-verde-900">{formatMoneda(resumen.neto)}</p>
          </div>
        </div>

        {/* Desglose por categoría */}
        {Object.keys(resumen.porCategoria).length > 0 && (
          <div className="mt-3 space-y-1.5 border-t border-verde-100 pt-3">
            {Object.entries(resumen.porCategoria)
              .sort()
              .map(([clave, monto]) => {
                const [tipo, cat] = clave.split(':')
                return (
                  <div key={clave} className="flex justify-between text-sm">
                    <span className="text-verde-700">
                      {tipo === 'ingreso' ? '↑' : '↓'} {ETIQUETA_CAT[cat] || cat}
                    </span>
                    <span className={tipo === 'ingreso' ? 'text-verde-900' : 'text-red-600'}>
                      {formatMoneda(monto)}
                    </span>
                  </div>
                )
              })}
          </div>
        )}
      </div>

      {/* Detalle de movimientos del mes */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-verde-700">
          Movimientos de {formatMes(mes)}
        </h3>
        {ordenadosMes.length === 0 ? (
          <Vacio icono="💰" titulo="Sin movimientos este mes" />
        ) : (
          <div className="space-y-2">
            {ordenadosMes.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-sm">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-verde-900">
                    {m.descripcion || ETIQUETA_CAT[m.categoria] || m.categoria}
                  </p>
                  <p className="text-xs text-verde-700">
                    {formatFechaCorta(m.fecha)} · {ETIQUETA_CAT[m.categoria] || m.categoria}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${m.tipo === 'ingreso' ? 'text-verde-700' : 'text-red-600'}`}>
                    {m.tipo === 'ingreso' ? '+' : '−'}{formatMoneda(m.monto)}
                  </span>
                  <button
                    onClick={() => eliminarMovimiento(m.id)}
                    className="grid h-7 w-7 place-items-center rounded-full text-verde-700/50 hover:bg-red-50 hover:text-red-600"
                    aria-label="Eliminar movimiento"
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EgresoModal open={egreso} onClose={() => setEgreso(false)} />
    </div>
  )
}

function EgresoModal({ open, onClose }) {
  const { agregarMovimiento } = useData()
  const [monto, setMonto] = useState('')
  const [categoria, setCategoria] = useState('insumos')
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState(hoyISO())

  function guardar(e) {
    e.preventDefault()
    if (!(Number(monto) > 0)) return
    agregarMovimiento({ tipo: 'egreso', categoria, monto, descripcion, fecha })
    setMonto('')
    setDescripcion('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo egreso" maxWidth="max-w-md">
      <form onSubmit={guardar} className="space-y-4">
        <Campo label="Importe *">
          <Input type="number" min="0" step="any" value={monto} onChange={(e) => setMonto(e.target.value)} autoFocus />
        </Campo>
        <Campo label="Categoría">
          <Select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {Object.entries(CATEGORIAS_EGRESO).map(([valor, label]) => (
              <option key={valor} value={valor}>{label}</option>
            ))}
          </Select>
        </Campo>
        <Campo label="Descripción">
          <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Detalle del gasto…" />
        </Campo>
        <Campo label="Fecha">
          <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </Campo>
        <div className="flex justify-end gap-2">
          <Boton variante="fantasma" onClick={onClose}>Cancelar</Boton>
          <Boton type="submit">Registrar egreso</Boton>
        </div>
      </form>
    </Modal>
  )
}
