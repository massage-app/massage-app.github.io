import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import TurnoModal from '../components/TurnoModal.jsx'
import FinalizarModal from '../components/FinalizarModal.jsx'
import { Boton, Badge, Vacio } from '../components/ui.jsx'
import {
  formatFechaLarga,
  formatMoneda,
  hoyISO,
  MODALIDADES_PAGO,
} from '../lib/format.js'

const ESTADOS = {
  pendiente: { label: 'Pendiente', color: 'amber' },
  realizado: { label: 'Realizado', color: 'verde' },
  cancelado: { label: 'Cancelado', color: 'gris' },
}

export default function Turnos() {
  const { turnos, nombreConvocante, cancelarTurno, eliminarTurno } = useData()
  const [nuevo, setNuevo] = useState(false)
  const [finalizando, setFinalizando] = useState(null)
  const [filtro, setFiltro] = useState('activos') // activos | todos | hoy

  const filtrados = useMemo(() => {
    let lista = [...turnos]
    if (filtro === 'activos') lista = lista.filter((t) => t.estado === 'pendiente')
    if (filtro === 'hoy') lista = lista.filter((t) => t.fecha === hoyISO())
    return lista.sort((a, b) =>
      (a.fecha + a.hora).localeCompare(b.fecha + b.hora) *
      (filtro === 'todos' ? -1 : 1),
    )
  }, [turnos, filtro])

  // Agrupar por fecha
  const grupos = useMemo(() => {
    const map = new Map()
    for (const t of filtrados) {
      if (!map.has(t.fecha)) map.set(t.fecha, [])
      map.get(t.fecha).push(t)
    }
    return [...map.entries()]
  }, [filtrados])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-verde-900">Turnos</h2>
        <Boton onClick={() => setNuevo(true)}>+ Nuevo turno</Boton>
      </div>

      <div className="flex gap-1.5">
        {[
          ['activos', 'Pendientes'],
          ['hoy', 'Hoy'],
          ['todos', 'Todos'],
        ].map(([valor, label]) => (
          <button
            key={valor}
            onClick={() => setFiltro(valor)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              filtro === valor
                ? 'bg-verde-700 text-white'
                : 'bg-white text-verde-700 hover:bg-verde-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {grupos.length === 0 ? (
        <Vacio icono="🗓️" titulo="No hay turnos para mostrar">
          Reservá un turno con el botón “Nuevo turno”.
        </Vacio>
      ) : (
        <div className="space-y-5">
          {grupos.map(([fecha, lista]) => (
            <div key={fecha}>
              <h3 className="mb-2 text-sm font-semibold text-verde-700 first-letter:uppercase">
                {formatFechaLarga(fecha)}
              </h3>
              <div className="space-y-2">
                {lista.map((t) => (
                  <TurnoCard
                    key={t.id}
                    turno={t}
                    nombre={nombreConvocante(t.convocanteId)}
                    onFinalizar={() => setFinalizando(t)}
                    onCancelar={() => cancelarTurno(t.id)}
                    onEliminar={() => eliminarTurno(t.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <TurnoModal open={nuevo} onClose={() => setNuevo(false)} />
      <FinalizarModal
        open={Boolean(finalizando)}
        onClose={() => setFinalizando(null)}
        turno={finalizando}
      />
    </div>
  )
}

function TurnoCard({ turno, nombre, onFinalizar, onCancelar, onEliminar }) {
  const estado = ESTADOS[turno.estado]
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-verde-100 px-2 py-0.5 text-sm font-bold text-verde-900">
              {turno.hora || '--:--'}
            </span>
            <span className="truncate font-semibold text-verde-900">{nombre}</span>
          </div>
          {turno.zona && <p className="mt-1 text-sm text-verde-700">📍 {turno.zona}</p>}
          {turno.notas && <p className="mt-0.5 text-sm text-verde-700/80">{turno.notas}</p>}
          {turno.estado === 'realizado' && turno.pago && (
            <p className="mt-1 text-sm font-medium text-verde-700">
              {formatMoneda(turno.pago.monto)} · {MODALIDADES_PAGO[turno.pago.modalidad]}
            </p>
          )}
        </div>
        <Badge color={estado.color}>{estado.label}</Badge>
      </div>

      {turno.estado === 'pendiente' && (
        <div className="mt-3 flex gap-2">
          <Boton variante="primario" className="flex-1" onClick={onFinalizar}>
            ✓ Finalizar servicio
          </Boton>
          <Boton variante="secundario" onClick={onCancelar}>Cancelar</Boton>
        </div>
      )}
      {turno.estado !== 'pendiente' && (
        <div className="mt-3 flex justify-end">
          <Boton variante="fantasma" onClick={onEliminar}>Eliminar</Boton>
        </div>
      )}
    </div>
  )
}
