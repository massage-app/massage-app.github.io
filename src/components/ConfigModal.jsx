import { useRef, useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import { usePwa } from '../context/PwaContext.jsx'
import { Modal, Campo, Input, Boton } from './ui.jsx'
import { verificarToken, subirBackup, bajarBackup } from '../lib/github.js'
import { hoyISO } from '../lib/format.js'

export default function ConfigModal({ open, onClose }) {
  const { config, actualizarConfig, exportarDatos, importarDatos } = useData()
  const { version, buscarActualizaciones, buscando, sinNovedades, hayActualizacion } = usePwa()

  const [masajista, setMasajista] = useState(config.masajista || '')
  const [tarifaFija, setTarifaFija] = useState(config.tarifaFija || '')
  const [token, setToken] = useState(config.githubToken || '')

  function guardarDatos(e) {
    e.preventDefault()
    actualizarConfig({
      masajista: masajista.trim(),
      tarifaFija: Number(tarifaFija) || 0,
      githubToken: token.trim(),
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Configuración" maxWidth="max-w-md">
      <form onSubmit={guardarDatos} className="space-y-5">
        {/* Datos del profesional */}
        <section className="space-y-4">
          <Campo label="Nombre del masajista" hint="Se muestra en la parte superior de la app.">
            <Input value={masajista} onChange={(e) => setMasajista(e.target.value)} placeholder="Ej. Ana Gómez" />
          </Campo>
          <Campo label="Tarifa fija" hint="Precio que se pre-carga al crear un turno (editable en ese momento).">
            <Input type="number" min="0" step="any" value={tarifaFija} onChange={(e) => setTarifaFija(e.target.value)} placeholder="0" />
          </Campo>
        </section>

        <BloqueBackup token={token} setToken={setToken} exportarDatos={exportarDatos} importarDatos={importarDatos} config={config} actualizarConfig={actualizarConfig} />

        {/* Actualizaciones y versión */}
        <section className="rounded-xl border border-verde-100 bg-verde-50/40 p-3">
          <p className="text-sm font-semibold text-verde-900">Actualizaciones</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-sm text-verde-700">Versión {version}</span>
            <Boton
              variante="secundario"
              onClick={buscarActualizaciones}
              disabled={buscando}
            >
              {buscando ? 'Buscando…' : 'Buscar actualizaciones'}
            </Boton>
          </div>
          {hayActualizacion && (
            <p className="mt-2 text-xs font-medium text-verde-700">
              Hay una nueva versión disponible (mirá el aviso arriba).
            </p>
          )}
          {sinNovedades && !hayActualizacion && (
            <p className="mt-2 text-xs text-verde-700/70">Ya tenés la última versión.</p>
          )}
        </section>

        <div className="flex justify-end gap-2 border-t border-verde-100 pt-3">
          <Boton variante="fantasma" onClick={onClose}>Cerrar</Boton>
          <Boton type="submit">Guardar</Boton>
        </div>
      </form>
    </Modal>
  )
}

function BloqueBackup({ token, setToken, exportarDatos, importarDatos, config, actualizarConfig }) {
  const inputArchivo = useRef(null)
  const [msg, setMsg] = useState(null) // { tipo: 'ok'|'error', texto }
  const [cargando, setCargando] = useState('') // 'exportar' | 'importar' | ''

  function feedback(tipo, texto) {
    setMsg({ tipo, texto })
    if (tipo === 'ok') setTimeout(() => setMsg(null), 4000)
  }

  // --- Backup local (archivo) ---
  function descargarArchivo() {
    const datos = exportarDatos()
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `masajes-backup-${hoyISO()}.json`
    a.click()
    URL.revokeObjectURL(url)
    feedback('ok', 'Copia descargada.')
  }

  function elegirArchivo() {
    inputArchivo.current?.click()
  }

  function leerArchivo(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result)
        if (!confirm('Esto reemplazará los datos actuales por los del backup. ¿Continuar?')) return
        importarDatos(obj)
        feedback('ok', 'Datos restaurados desde el archivo.')
      } catch (err) {
        feedback('error', 'No se pudo leer el archivo: ' + err.message)
      }
    }
    reader.readAsText(file)
    e.target.value = '' // permite reimportar el mismo archivo
  }

  // --- Backup en GitHub (gist privado) ---
  async function guardarEnGitHub() {
    const t = token.trim()
    if (!t) return feedback('error', 'Ingresá tu token de GitHub primero.')
    setCargando('exportar')
    setMsg(null)
    try {
      await verificarToken(t)
      const nuevoGistId = await subirBackup(t, config.gistId || null, exportarDatos())
      actualizarConfig({ githubToken: t, gistId: nuevoGistId })
      feedback('ok', 'Backup guardado en GitHub.')
    } catch (err) {
      feedback('error', err.message)
    } finally {
      setCargando('')
    }
  }

  async function restaurarDeGitHub() {
    const t = token.trim()
    if (!t) return feedback('error', 'Ingresá tu token de GitHub primero.')
    if (!config.gistId) return feedback('error', 'Todavía no guardaste ningún backup en GitHub.')
    setCargando('importar')
    setMsg(null)
    try {
      const backup = await bajarBackup(t, config.gistId)
      if (!confirm('Esto reemplazará los datos actuales por los de GitHub. ¿Continuar?')) {
        setCargando('')
        return
      }
      importarDatos(backup)
      feedback('ok', 'Datos restaurados desde GitHub.')
    } catch (err) {
      feedback('error', err.message)
    } finally {
      setCargando('')
    }
  }

  return (
    <section className="rounded-xl border border-verde-100 bg-verde-50/40 p-3">
      <p className="text-sm font-semibold text-verde-900">Copia de seguridad</p>

      {/* Archivo */}
      <div className="mt-2">
        <p className="mb-1.5 text-xs text-verde-700">En este dispositivo (archivo):</p>
        <div className="flex gap-2">
          <Boton variante="secundario" className="flex-1" onClick={descargarArchivo}>⬇ Exportar</Boton>
          <Boton variante="secundario" className="flex-1" onClick={elegirArchivo}>⬆ Importar</Boton>
          <input ref={inputArchivo} type="file" accept="application/json,.json" onChange={leerArchivo} className="hidden" />
        </div>
      </div>

      {/* GitHub */}
      <div className="mt-3 border-t border-verde-100 pt-3">
        <p className="mb-1.5 text-xs text-verde-700">En la nube (GitHub · gist privado):</p>
        <Campo label="Token de GitHub" hint="Personal Access Token con permiso 'gist'. Se guarda sólo en este dispositivo.">
          <Input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_… / github_pat_…"
            autoComplete="off"
          />
        </Campo>
        <div className="mt-2 flex gap-2">
          <Boton variante="primario" className="flex-1" onClick={guardarEnGitHub} disabled={cargando === 'exportar'}>
            {cargando === 'exportar' ? 'Guardando…' : '☁ Guardar'}
          </Boton>
          <Boton variante="secundario" className="flex-1" onClick={restaurarDeGitHub} disabled={cargando === 'importar'}>
            {cargando === 'importar' ? 'Restaurando…' : '⤓ Restaurar'}
          </Boton>
        </div>
        {config.gistId && (
          <p className="mt-1.5 text-xs text-verde-700/70">Backup vinculado ✓</p>
        )}
      </div>

      {msg && (
        <p className={`mt-3 rounded-lg px-3 py-2 text-xs ${msg.tipo === 'ok' ? 'bg-verde-100 text-verde-900' : 'bg-red-100 text-red-700'}`}>
          {msg.texto}
        </p>
      )}
    </section>
  )
}
