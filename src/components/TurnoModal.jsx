import { useEffect, useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import { Modal, Campo, Input, TextArea, Select, Boton } from './ui.jsx'
import { hoyISO } from '../lib/format.js'

// Reserva de turno. Si se pasa `convocanteId` fijo, no se muestra el selector.
export default function TurnoModal({ open, onClose, convocanteId: fijo }) {
  const { convocantes, crearTurno, config } = useData()
  const [convocanteId, setConvocanteId] = useState(fijo || '')
  const [fecha, setFecha] = useState(hoyISO())
  const [hora, setHora] = useState('')
  const [zona, setZona] = useState('')
  const [precio, setPrecio] = useState('')
  const [notas, setNotas] = useState('')

  // Al abrir, reinicia el formulario y pre-carga la tarifa fija vigente.
  useEffect(() => {
    if (open) {
      setConvocanteId(fijo || '')
      setFecha(hoyISO())
      setHora('')
      setZona('')
      setNotas('')
      setPrecio(config.tarifaFija ? String(config.tarifaFija) : '')
    }
  }, [open, fijo, config.tarifaFija])

  function guardar(e) {
    e.preventDefault()
    const id = fijo || convocanteId
    if (!id || !fecha || !hora) return
    crearTurno({ convocanteId: id, fecha, hora, zona, precio, notas })
    onClose()
  }

  const ordenados = [...convocantes].sort((a, b) => a.nombre.localeCompare(b.nombre))

  return (
    <Modal open={open} onClose={onClose} title="Nuevo turno">
      <form onSubmit={guardar} className="space-y-4">
        {!fijo && (
          <Campo label="Convocante *">
            <Select value={convocanteId} onChange={(e) => setConvocanteId(e.target.value)}>
              <option value="">Seleccionar…</option>
              {ordenados.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </Select>
          </Campo>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Día *">
            <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </Campo>
          <Campo label="Hora *">
            <Input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
          </Campo>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Zona">
            <Input value={zona} onChange={(e) => setZona(e.target.value)} placeholder="Domicilio, consultorio..." />
          </Campo>
          <Campo label="Tarifa" hint="Editable para este turno.">
            <Input type="number" min="0" step="any" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="0" />
          </Campo>
        </div>
        <Campo label="Notas">
          <TextArea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Detalles del turno..." />
        </Campo>
        <div className="flex justify-end gap-2 pt-1">
          <Boton variante="fantasma" onClick={onClose}>Cancelar</Boton>
          <Boton type="submit">Reservar turno</Boton>
        </div>
      </form>
    </Modal>
  )
}
