// ---------------------------------------------------------------------------
// Capa de persistencia.
//
// Toda la app habla con estas funciones y NUNCA con localStorage directamente.
// Cuando quieras migrar a Firebase, sólo se reescribe este archivo (leer/guardar
// cada colección) y el resto de la aplicación queda intacto.
// ---------------------------------------------------------------------------

const PREFIX = 'masajes:'

export const COLECCIONES = {
  CONVOCANTES: 'convocantes',
  TURNOS: 'turnos',
  MOVIMIENTOS: 'movimientos',
}

const CONFIG_KEY = 'config'

export const CONFIG_INICIAL = {
  masajista: '',
  tarifaFija: 0,
  githubToken: '', // token personal (scope gist), sólo en este dispositivo
  gistId: '', // id del gist de backup, se completa al primer backup
}

function leer(coleccion) {
  try {
    const raw = localStorage.getItem(PREFIX + coleccion)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.error('Error leyendo', coleccion, err)
    return []
  }
}

function escribir(coleccion, datos) {
  localStorage.setItem(PREFIX + coleccion, JSON.stringify(datos))
}

// Carga todas las colecciones de una sola vez (para inicializar el estado).
export function cargarTodo() {
  return {
    convocantes: leer(COLECCIONES.CONVOCANTES),
    turnos: leer(COLECCIONES.TURNOS),
    movimientos: leer(COLECCIONES.MOVIMIENTOS),
    config: leerConfig(),
  }
}

// Persiste una colección completa.
export function guardarColeccion(coleccion, datos) {
  escribir(coleccion, datos)
}

// Configuración de la app (objeto único, no colección).
export function leerConfig() {
  try {
    const raw = localStorage.getItem(PREFIX + CONFIG_KEY)
    return raw ? { ...CONFIG_INICIAL, ...JSON.parse(raw) } : { ...CONFIG_INICIAL }
  } catch (err) {
    console.error('Error leyendo config', err)
    return { ...CONFIG_INICIAL }
  }
}

export function guardarConfig(config) {
  localStorage.setItem(PREFIX + CONFIG_KEY, JSON.stringify(config))
}

// Genera un id único.
export function nuevoId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  )
}
