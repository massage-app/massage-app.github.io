import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import TurnoModal from '../components/TurnoModal.jsx'
import ConvocanteModal from '../components/ConvocanteModal.jsx'
import FinalizarModal from '../components/FinalizarModal.jsx'
import { Boton, Vacio } from '../components/ui.jsx'
import { formatFechaLarga, hoyISO } from '../lib/format.js'

export default function Inicio() {
  const { turnos, nombreConvocante } = useData()
  const [nuevoTurno, setNuevoTurno] = useState(false)
  const [nuevoConvocante, setNuevoConvocante] = useState(false)
  const [finalizando, setFinalizando] = useState(null)

  const hoy = hoyISO()

  const turnosHoy = useMemo(
    () =>
      turnos
        .filter((t) => t.fecha === hoy && t.estado === 'pendiente')
        .sort((a, b) => a.hora.localeCompare(b.hora)),
    [turnos, hoy],
  )

  return (
    <div className="space-y-4">
      <p className="text-sm text-verde-700 first-letter:uppercase">{formatFechaLarga(hoy)}</p>

      {/* Acciones rápidas */}
      <div className="flex gap-2">
        <Boton className="flex-1" onClick={() => setNuevoTurno(true)}>+ Turno</Boton>
        <Boton className="flex-1" variante="secundario" onClick={() => setNuevoConvocante(true)}>
          + Convocante
        </Boton>
      </div>

      {/* Turnos de hoy */}
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-verde-900">Agenda de hoy</h2>
          {turnosHoy.length > 0 && (
            <span className="text-sm font-medium text-verde-700">
              {turnosHoy.length} turno{turnosHoy.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
        {turnosHoy.length === 0 ? (
          <Vacio icono="☕" titulo="No hay turnos pendientes para hoy" />
        ) : (
          <div className="space-y-2">
            {turnosHoy.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-verde-100 px-2 py-0.5 text-sm font-bold text-verde-900">{t.hora}</span>
                    <span className="truncate font-semibold text-verde-900">{nombreConvocante(t.convocanteId)}</span>
                  </div>
                  {t.zona && <p className="mt-1 text-sm text-verde-700">📍 {t.zona}</p>}
                </div>
                <Boton variante="primario" onClick={() => setFinalizando(t)}>Finalizar</Boton>
              </div>
            ))}
          </div>
        )}
      </div>

      <TurnoModal open={nuevoTurno} onClose={() => setNuevoTurno(false)} />
      <ConvocanteModal open={nuevoConvocante} onClose={() => setNuevoConvocante(false)} />
      <FinalizarModal open={Boolean(finalizando)} onClose={() => setFinalizando(null)} turno={finalizando} />
    </div>
  )
}
