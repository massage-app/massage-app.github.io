import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { usePwa } from '../context/PwaContext.jsx'
import ConfigModal from './ConfigModal.jsx'

const items = [
  { to: '/', label: 'Inicio', icono: '🏠', end: true },
  { to: '/convocantes', label: 'Convocantes', icono: '🧍' },
  { to: '/turnos', label: 'Turnos', icono: '🗓️' },
  { to: '/caja', label: 'Caja', icono: '💰' },
]

export default function Layout() {
  const { config } = useData()
  const { hayActualizacion, aplicarActualizacion, descartarActualizacion } = usePwa()
  const [verConfig, setVerConfig] = useState(false)

  return (
    <div className="mx-auto flex min-h-full max-w-5xl flex-col">
      {/* Aviso de actualización disponible */}
      {hayActualizacion && (
        <div className="flex items-center justify-between gap-2 bg-verde-900 px-4 py-2.5 text-sm text-white">
          <span>🔄 Hay una nueva versión disponible.</span>
          <div className="flex gap-2">
            <button onClick={aplicarActualizacion} className="rounded-lg bg-white px-3 py-1 font-semibold text-verde-900">
              Actualizar
            </button>
            <button onClick={descartarActualizacion} className="rounded-lg px-2 py-1 text-verde-100" aria-label="Descartar">
              ✕
            </button>
          </div>
        </div>
      )}
      {/* Encabezado */}
      <header className="flex items-center gap-3 px-5 pt-6 pb-2">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-verde-700 text-lg text-white">
          💆
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold leading-tight text-verde-900">
            {config.masajista || 'Masajes'}
          </h1>
          <p className="text-xs text-verde-700">Gestión de turnos</p>
        </div>
        <button
          onClick={() => setVerConfig(true)}
          className="grid h-10 w-10 place-items-center rounded-xl text-verde-700 transition hover:bg-white"
          aria-label="Configuración"
          title="Configuración"
        >
          <span className="text-xl">⚙️</span>
        </button>
      </header>

      <ConfigModal open={verConfig} onClose={() => setVerConfig(false)} />

      {/* Navegación */}
      <nav className="sticky top-0 z-30 mx-3 mt-2 flex gap-1 rounded-2xl bg-white/80 p-1.5 shadow-sm backdrop-blur">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) =>
              `flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? 'bg-verde-700 text-white'
                  : 'text-verde-700 hover:bg-verde-50'
              }`
            }
          >
            <span className="text-base">{it.icono}</span>
            <span className="hidden sm:inline">{it.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Contenido */}
      <main className="flex-1 px-3 py-4 pb-16">
        <Outlet />
      </main>
    </div>
  )
}
