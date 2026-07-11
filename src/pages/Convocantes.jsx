import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import ConvocanteModal from '../components/ConvocanteModal.jsx'
import TurnoModal from '../components/TurnoModal.jsx'
import { Modal, Boton, Badge, Input, Select, Campo, Vacio } from '../components/ui.jsx'
import { formatMoneda, formatFechaCorta, MODALIDADES_PAGO } from '../lib/format.js'

export default function Convocantes() {
  const { convocantes } = useData()
  const [busqueda, setBusqueda] = useState('')
  const [nuevo, setNuevo] = useState(false)
  const [editar, setEditar] = useState(null)
  const [detalle, setDetalle] = useState(null)

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return [...convocantes]
      .filter(
        (c) =>
          !q ||
          c.nombre.toLowerCase().includes(q) ||
          c.telefono.includes(q) ||
          c.zona.toLowerCase().includes(q),
      )
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [convocantes, busqueda])

  // El detalle se re-obtiene del store para reflejar cambios (cta cte, etc.)
  const detalleActual = detalle
    ? convocantes.find((c) => c.id === detalle.id)
    : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-verde-900">Convocantes</h2>
        <Boton onClick={() => setNuevo(true)}>+ Nuevo</Boton>
      </div>

      <Input
        placeholder="Buscar por nombre, teléfono o zona…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {lista.length === 0 ? (
        <Vacio icono="🧍" titulo="Todavía no hay convocantes">
          Cargá el primero con el botón “Nuevo”.
        </Vacio>
      ) : (
        <div className="space-y-2">
          {lista.map((c) => (
            <button
              key={c.id}
              onClick={() => setDetalle(c)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white p-4 text-left shadow-sm transition hover:bg-verde-50/60"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-verde-900">{c.nombre}</p>
                <p className="truncate text-sm text-verde-700">
                  {[c.telefono, c.zona].filter(Boolean).join(' · ') || 'Sin datos de contacto'}
                </p>
              </div>
              {c.cuentaCorriente > 0 && (
                <Badge color="amber">Debe {formatMoneda(c.cuentaCorriente)}</Badge>
              )}
            </button>
          ))}
        </div>
      )}

      <ConvocanteModal open={nuevo} onClose={() => setNuevo(false)} />
      <ConvocanteModal
        open={Boolean(editar)}
        onClose={() => setEditar(null)}
        convocante={editar}
      />
      <DetalleConvocante
        convocante={detalleActual}
        onClose={() => setDetalle(null)}
        onEditar={(c) => {
          setDetalle(null)
          setEditar(c)
        }}
      />
    </div>
  )
}

function DetalleConvocante({ convocante, onClose, onEditar }) {
  const { turnos, eliminarConvocante } = useData()
  const [nuevoTurno, setNuevoTurno] = useState(false)
  const [cobrando, setCobrando] = useState(false)

  if (!convocante) return null

  const historial = turnos
    .filter((t) => t.convocanteId === convocante.id)
    .sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora))

  const ficha = convocante.ficha || {}
  const fichaItems = [
    ['Objetivo', ficha.objetivo],
    ['Antecedentes / lesiones', ficha.antecedentes],
    ['Zonas de dolor', ficha.zonasDolor],
    ['Presión preferida', ficha.presion],
    ['Alergias', ficha.alergias],
    ['Observaciones', ficha.observaciones],
  ].filter(([, v]) => v && v.trim())

  function borrar() {
    if (confirm(`¿Eliminar a ${convocante.nombre} y todos sus turnos?`)) {
      eliminarConvocante(convocante.id)
      onClose()
    }
  }

  return (
    <>
      <Modal open onClose={onClose} title={convocante.nombre}>
        <div className="space-y-4">
          <p className="text-sm text-verde-700">
            {[convocante.telefono, convocante.zona].filter(Boolean).join(' · ') || 'Sin datos de contacto'}
          </p>

          {/* Cuenta corriente */}
          {convocante.cuentaCorriente > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">
              <div>
                <p className="text-xs font-medium text-amber-700">Cuenta corriente</p>
                <p className="text-lg font-bold text-amber-800">
                  {formatMoneda(convocante.cuentaCorriente)}
                </p>
              </div>
              <Boton variante="secundario" onClick={() => setCobrando(true)}>
                Registrar cobro
              </Boton>
            </div>
          )}

          {/* Ficha técnica */}
          {fichaItems.length > 0 && (
            <div className="rounded-xl border border-verde-100 bg-verde-50/40 p-3">
              <p className="mb-2 text-sm font-semibold text-verde-900">📋 Ficha técnica</p>
              <dl className="space-y-2">
                {fichaItems.map(([label, valor]) => (
                  <div key={label}>
                    <dt className="text-xs font-medium text-verde-700">{label}</dt>
                    <dd className="text-sm text-verde-900">{valor}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Historial de turnos */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-verde-900">Turnos ({historial.length})</p>
              <Boton variante="secundario" onClick={() => setNuevoTurno(true)}>+ Turno</Boton>
            </div>
            {historial.length === 0 ? (
              <p className="text-sm text-verde-700/70">Sin turnos registrados.</p>
            ) : (
              <div className="space-y-1.5">
                {historial.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg bg-verde-50/60 px-3 py-2 text-sm">
                    <span className="text-verde-900">
                      {formatFechaCorta(t.fecha)} · {t.hora}
                    </span>
                    <span className="text-verde-700">
                      {t.estado === 'realizado' && t.pago
                        ? `${formatMoneda(t.pago.monto)} · ${MODALIDADES_PAGO[t.pago.modalidad]}`
                        : t.estado}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between gap-2 border-t border-verde-100 pt-3">
            <Boton variante="peligro" onClick={borrar}>Eliminar</Boton>
            <Boton variante="secundario" onClick={() => onEditar(convocante)}>Editar</Boton>
          </div>
        </div>
      </Modal>

      <TurnoModal
        open={nuevoTurno}
        onClose={() => setNuevoTurno(false)}
        convocanteId={convocante.id}
      />
      <CobrarModal
        open={cobrando}
        onClose={() => setCobrando(false)}
        convocante={convocante}
      />
    </>
  )
}

function CobrarModal({ open, onClose, convocante }) {
  const { cobrarCuentaCorriente } = useData()
  const [monto, setMonto] = useState('')
  const [modalidad, setModalidad] = useState('efectivo')

  function guardar(e) {
    e.preventDefault()
    cobrarCuentaCorriente(convocante.id, { monto, modalidad })
    setMonto('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Registrar cobro de cuenta" maxWidth="max-w-md">
      <form onSubmit={guardar} className="space-y-4">
        <p className="text-sm text-verde-700">
          Deuda actual: <strong>{formatMoneda(convocante?.cuentaCorriente)}</strong>
        </p>
        <Campo label="Importe a cobrar *">
          <Input
            type="number"
            min="0"
            step="any"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            autoFocus
          />
        </Campo>
        <Campo label="Modalidad">
          <Select value={modalidad} onChange={(e) => setModalidad(e.target.value)}>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
          </Select>
        </Campo>
        <div className="flex justify-end gap-2">
          <Boton variante="fantasma" onClick={onClose}>Cancelar</Boton>
          <Boton type="submit">Registrar cobro</Boton>
        </div>
      </form>
    </Modal>
  )
}
