// ---------------------------------------------------------------------------
// Backup en la nube usando GitHub Gists (privados).
//
// El token del usuario (scope "gist") se guarda SÓLO en localStorage de su
// dispositivo, nunca se sube al repositorio. El gist se crea como privado.
// ---------------------------------------------------------------------------

const API = 'https://api.github.com'
const ARCHIVO = 'masajes-backup.json'

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

// Verifica el token y devuelve el nombre de usuario.
export async function verificarToken(token) {
  const res = await fetch(`${API}/user`, { headers: headers(token) })
  if (!res.ok) throw new Error('Token inválido o sin permisos.')
  const data = await res.json()
  return data.login
}

// Sube el backup. Crea el gist la primera vez o actualiza el existente.
// Devuelve el id del gist.
export async function subirBackup(token, gistId, contenido) {
  const body = {
    description: `Masajes · backup ${new Date().toISOString()}`,
    files: { [ARCHIVO]: { content: JSON.stringify(contenido, null, 2) } },
  }

  let res
  if (gistId) {
    res = await fetch(`${API}/gists/${gistId}`, {
      method: 'PATCH',
      headers: headers(token),
      body: JSON.stringify(body),
    })
    // Si el gist ya no existe, lo recreamos.
    if (res.status === 404) return subirBackup(token, null, contenido)
  } else {
    res = await fetch(`${API}/gists`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ ...body, public: false }),
    })
  }

  if (!res.ok) throw new Error(`Error al subir el backup (${res.status}).`)
  const data = await res.json()
  return data.id
}

// Descarga el backup desde el gist. Devuelve el objeto de datos.
export async function bajarBackup(token, gistId) {
  if (!gistId) throw new Error('No hay backup guardado en GitHub todavía.')
  const res = await fetch(`${API}/gists/${gistId}`, { headers: headers(token) })
  if (!res.ok) throw new Error(`No se pudo leer el backup (${res.status}).`)
  const data = await res.json()
  const archivo = data.files?.[ARCHIVO]
  if (!archivo) throw new Error('El gist no contiene un backup válido.')
  return JSON.parse(archivo.content)
}
