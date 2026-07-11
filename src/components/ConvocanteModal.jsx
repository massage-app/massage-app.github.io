import { useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import { Modal, Campo, Input, TextArea, Boton } from './ui.jsx'

const fichaVacia = {
  objetivo: '',
  antecedentes: '',
  zonasDolor: '',
  presion: '',
  alergias: '',
  observaciones: '',
}

export default function ConvocanteModal({ open, onClose, convocante }) {
  const { crearConvocante, actualizarConvocante } = useData()
  const esEdicion = Boolean(convocante)

  const [nombre, setNombre] = useState(convocante?.nombre || '')
  const [telefono, setTelefono] = useState(convocante?.telefono || '')
  const [zona, setZona] = useState(convocante?.zona || '')
  const [verFicha, setVerFicha] = useState(false)
  const [ficha, setFicha] = useState({ ...fichaVacia, ...(convocante?.ficha || {}) })

  function setF(campo, valor) {
    setFicha((prev) => ({ ...prev, [campo]: valor }))
  }

  function guardar(e) {
    e.preventDefault()
    if (!nombre.trim()) return
    const datos = { nombre, telefono, zona, ficha }
    if (esEdicion) actualizarConvocante(convocante.id, datos)
    else crearConvocante(datos)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={esEdicion ? 'Editar convocante' : 'Nuevo convocante'}>
      <form onSubmit={guardar} className="space-y-4">
        <Campo label="Nombre *">
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre y apellido" autoFocus />
        </Campo>
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Teléfono">
            <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ej. 11 5555 5555" inputMode="tel" />
          </Campo>
          <Campo label="Zona">
            <Input value={zona} onChange={(e) => setZona(e.target.value)} placeholder="Ej. Palermo" />
          </Campo>
        </div>

        {/* Ficha técnica (opcional) */}
        <div className="rounded-xl border border-verde-100 bg-verde-50/40">
          <button
            type="button"
            onClick={() => setVerFicha((v) => !v)}
            className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-semibold text-verde-900"
          >
            <span>📋 Ficha técnica (opcional)</span>
            <span>{verFicha ? '−' : '+'}</span>
          </button>
          {verFicha && (
            <div className="space-y-3 border-t border-verde-100 p-3">
              <Campo label="Objetivo / motivo de consulta">
                <Input value={ficha.objetivo} onChange={(e) => setF('objetivo', e.target.value)} placeholder="Ej. Relajación, contracturas..." />
              </Campo>
              <Campo label="Antecedentes / lesiones">
                <TextArea value={ficha.antecedentes} onChange={(e) => setF('antecedentes', e.target.value)} placeholder="Operaciones, lesiones, condiciones..." />
              </Campo>
              <div className="grid grid-cols-2 gap-3">
                <Campo label="Zonas de dolor">
                  <Input value={ficha.zonasDolor} onChange={(e) => setF('zonasDolor', e.target.value)} placeholder="Cervical, lumbar..." />
                </Campo>
                <Campo label="Presión preferida">
                  <Input value={ficha.presion} onChange={(e) => setF('presion', e.target.value)} placeholder="Suave / media / fuerte" />
                </Campo>
              </div>
              <Campo label="Alergias / sensibilidades">
                <Input value={ficha.alergias} onChange={(e) => setF('alergias', e.target.value)} placeholder="Aceites, cremas..." />
              </Campo>
              <Campo label="Observaciones">
                <TextArea value={ficha.observaciones} onChange={(e) => setF('observaciones', e.target.value)} placeholder="Notas del profesional..." />
              </Campo>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Boton variante="fantasma" onClick={onClose}>Cancelar</Boton>
          <Boton type="submit">{esEdicion ? 'Guardar cambios' : 'Crear convocante'}</Boton>
        </div>
      </form>
    </Modal>
  )
}
