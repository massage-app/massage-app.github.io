import { createContext, useContext, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

const PwaContext = createContext(null)

// Gestiona el service worker: versión, detección de actualizaciones y aplicación.
export function PwaProvider({ children }) {
  const registroRef = useRef(null)
  const [buscando, setBuscando] = useState(false)
  const [sinNovedades, setSinNovedades] = useState(false)

  const {
    needRefresh: [hayActualizacion, setHayActualizacion],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registro) {
      registroRef.current = registro
      if (!registro) return
      // Revisar actualizaciones cada 60s y al volver la app a primer plano,
      // para que una PWA instalada no quede pegada en una versión vieja.
      const revisar = () => registro.update().catch(() => {})
      setInterval(revisar, 60 * 1000)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') revisar()
      })
    },
  })

  async function buscarActualizaciones() {
    setBuscando(true)
    setSinNovedades(false)
    try {
      await registroRef.current?.update()
    } catch (err) {
      console.error('Error buscando actualizaciones', err)
    }
    // Damos un momento para que el SW detecte cambios.
    setTimeout(() => {
      setBuscando(false)
      setSinNovedades((prev) => (hayActualizacion ? prev : true))
    }, 1800)
  }

  const value = {
    version: __APP_VERSION__,
    hayActualizacion,
    buscando,
    sinNovedades,
    aplicarActualizacion: () => updateServiceWorker(true),
    descartarActualizacion: () => setHayActualizacion(false),
    buscarActualizaciones,
  }

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>
}

export function usePwa() {
  const ctx = useContext(PwaContext)
  if (!ctx) throw new Error('usePwa debe usarse dentro de <PwaProvider>')
  return ctx
}
