import { useEffect, useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import { Modal, Campo, Input, Boton } from './ui.jsx'
import { MODALIDADES_PAGO } from '../lib/format.js'

// Finalizar servicio: importe + modalidad de pago.
export default function FinalizarModal({ open, onClose, turno }) {
  const { finalizarTurno, nombreConvocante, config } = useData()
  const [monto, setMonto] = useState('')
  const [modalidad, setModalidad] = useState('efectivo')

  // Al abrir, pre-carga el importe con la tarifa del turno (o la tarifa fija).
  useEffect(() => {
    if (open && turno) {
      const base = turno.precio ?? config.tarifaFija ?? 0
      setMonto(base ? String(base) : '')
      setModalidad('efectivo')
    }
  }, [open, turno, config.tarifaFija])

  function guardar(e) {
    e.preventDefault()
    if (!turno) return
    finalizarTurno(turno.id, { modalidad, monto })
    onClose()
  }

  if (!turno) return null

  return (
    <Modal open={open} onClose={onClose} title="Finalizar servicio" maxWidth="max-w-md">
      <form onSubmit={guardar} className="space-y-4">
        <p className="text-sm text-verde-700">
          {nombreConvocante(turno.convocanteId)} · {turno.fecha} {turno.hora}
        </p>

        <Campo label="Importe cobrado *">
          <Input
            type="number"
            min="0"
            step="any"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0"
            autoFocus
          />
        </Campo>

        <Campo label="Modalidad de pago">
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(MODALIDADES_PAGO).map(([valor, label]) => (
              <button
                key={valor}
                type="button"
                onClick={() => setModalidad(valor)}
                className={`rounded-xl border px-2 py-3 text-xs font-semibold transition ${
                  modalidad === valor
                    ? 'border-verde-700 bg-verde-700 text-white'
                    : 'border-verde-100 bg-verde-50/40 text-verde-900 hover:border-verde-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Campo>

        {modalidad === 'ctacte' && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
            El importe se sumará a la cuenta corriente del convocante y no ingresa a la caja hasta que se cobre.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Boton variante="fantasma" onClick={onClose}>Cancelar</Boton>
          <Boton type="submit">Finalizar y registrar</Boton>
        </div>
      </form>
    </Modal>
  )
}
