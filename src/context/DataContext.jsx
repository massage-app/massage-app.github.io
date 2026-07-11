import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  cargarTodo,
  guardarColeccion,
  guardarConfig,
  nuevoId,
  COLECCIONES,
} from '../data/storage.js'
import { hoyISO } from '../lib/format.js'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const inicial = useMemo(() => cargarTodo(), [])
  const [convocantes, setConvocantes] = useState(inicial.convocantes)
  const [turnos, setTurnos] = useState(inicial.turnos)
  const [movimientos, setMovimientos] = useState(inicial.movimientos)
  const [config, setConfig] = useState(inicial.config)

  // Persistencia automática ante cualquier cambio.
  useEffect(() => {
    guardarColeccion(COLECCIONES.CONVOCANTES, convocantes)
  }, [convocantes])
  useEffect(() => {
    guardarColeccion(COLECCIONES.TURNOS, turnos)
  }, [turnos])
  useEffect(() => {
    guardarColeccion(COLECCIONES.MOVIMIENTOS, movimientos)
  }, [movimientos])
  useEffect(() => {
    guardarConfig(config)
  }, [config])

  // ----------------------------------------------------------------------
  // CONFIGURACIÓN
  // ----------------------------------------------------------------------
  function actualizarConfig(cambios) {
    setConfig((prev) => ({ ...prev, ...cambios }))
  }

  // ----------------------------------------------------------------------
  // CONVOCANTES
  // ----------------------------------------------------------------------
  function crearConvocante({ nombre, telefono, zona, ficha }) {
    const nuevo = {
      id: nuevoId(),
      nombre: nombre.trim(),
      telefono: (telefono || '').trim(),
      zona: (zona || '').trim(),
      ficha: ficha || {},
      cuentaCorriente: 0, // saldo adeudado (positivo = debe)
      createdAt: new Date().toISOString(),
    }
    setConvocantes((prev) => [...prev, nuevo])
    return nuevo
  }

  function actualizarConvocante(id, cambios) {
    setConvocantes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...cambios } : c)),
    )
  }

  function eliminarConvocante(id) {
    setConvocantes((prev) => prev.filter((c) => c.id !== id))
    setTurnos((prev) => prev.filter((t) => t.convocanteId !== id))
  }

  // ----------------------------------------------------------------------
  // TURNOS
  // ----------------------------------------------------------------------
  function crearTurno({ convocanteId, fecha, hora, zona, notas, precio }) {
    const nuevo = {
      id: nuevoId(),
      convocanteId,
      fecha,
      hora,
      zona: (zona || '').trim(),
      notas: (notas || '').trim(),
      estado: 'pendiente', // pendiente | realizado | cancelado
      precio: precio != null && precio !== '' ? Number(precio) : null,
      pago: null, // { modalidad, monto }
      createdAt: new Date().toISOString(),
      finalizadoAt: null,
    }
    setTurnos((prev) => [...prev, nuevo])
    return nuevo
  }

  function actualizarTurno(id, cambios) {
    setTurnos((prev) => prev.map((t) => (t.id === id ? { ...t, ...cambios } : t)))
  }

  function cancelarTurno(id) {
    actualizarTurno(id, { estado: 'cancelado' })
  }

  function eliminarTurno(id) {
    setTurnos((prev) => prev.filter((t) => t.id !== id))
  }

  // Finalizar servicio: registra el pago y actualiza caja / cuenta corriente.
  function finalizarTurno(id, { modalidad, monto }) {
    const turno = turnos.find((t) => t.id === id)
    if (!turno) return
    const importe = Number(monto) || 0

    actualizarTurno(id, {
      estado: 'realizado',
      precio: importe,
      pago: { modalidad, monto: importe },
      finalizadoAt: new Date().toISOString(),
    })

    if (modalidad === 'ctacte') {
      // No entra plata: se suma a la deuda del convocante.
      setConvocantes((prev) =>
        prev.map((c) =>
          c.id === turno.convocanteId
            ? { ...c, cuentaCorriente: (c.cuentaCorriente || 0) + importe }
            : c,
        ),
      )
    } else {
      // Efectivo o transferencia: ingreso a la caja del día.
      agregarMovimiento({
        tipo: 'ingreso',
        categoria: modalidad,
        monto: importe,
        descripcion: `Servicio · ${nombreConvocante(turno.convocanteId)}`,
        convocanteId: turno.convocanteId,
        turnoId: turno.id,
      })
    }
  }

  // ----------------------------------------------------------------------
  // CAJA (movimientos)
  // ----------------------------------------------------------------------
  function agregarMovimiento({
    tipo,
    categoria,
    monto,
    descripcion,
    convocanteId = null,
    turnoId = null,
    fecha = hoyISO(),
  }) {
    const nuevo = {
      id: nuevoId(),
      fecha,
      tipo, // ingreso | egreso
      categoria,
      monto: Number(monto) || 0,
      descripcion: (descripcion || '').trim(),
      convocanteId,
      turnoId,
      createdAt: new Date().toISOString(),
    }
    setMovimientos((prev) => [...prev, nuevo])
    return nuevo
  }

  function eliminarMovimiento(id) {
    setMovimientos((prev) => prev.filter((m) => m.id !== id))
  }

  // Registrar cobro de cuenta corriente: baja la deuda e ingresa a caja.
  function cobrarCuentaCorriente(convocanteId, { monto, modalidad }) {
    const importe = Number(monto) || 0
    if (importe <= 0) return
    setConvocantes((prev) =>
      prev.map((c) =>
        c.id === convocanteId
          ? { ...c, cuentaCorriente: Math.max(0, (c.cuentaCorriente || 0) - importe) }
          : c,
      ),
    )
    agregarMovimiento({
      tipo: 'ingreso',
      categoria: modalidad, // efectivo | transferencia
      monto: importe,
      descripcion: `Cobro cuenta corriente · ${nombreConvocante(convocanteId)}`,
      convocanteId,
    })
  }

  // ----------------------------------------------------------------------
  // Helpers derivados
  // ----------------------------------------------------------------------
  function nombreConvocante(id) {
    return convocantes.find((c) => c.id === id)?.nombre || 'Sin nombre'
  }

  // ----------------------------------------------------------------------
  // BACKUP (exportar / importar)
  // ----------------------------------------------------------------------
  function exportarDatos() {
    // No incluimos el token de GitHub en el backup.
    const { githubToken, ...configSegura } = config
    return {
      app: 'masajes-app',
      version: __APP_VERSION__,
      exportadoEl: new Date().toISOString(),
      data: { convocantes, turnos, movimientos, config: configSegura },
    }
  }

  function importarDatos(backup) {
    const d = backup?.data || backup
    if (!d || typeof d !== 'object') {
      throw new Error('El archivo no es un backup válido de Masajes.')
    }
    if (Array.isArray(d.convocantes)) setConvocantes(d.convocantes)
    if (Array.isArray(d.turnos)) setTurnos(d.turnos)
    if (Array.isArray(d.movimientos)) setMovimientos(d.movimientos)
    if (d.config && typeof d.config === 'object') {
      // Conservamos el token del dispositivo actual.
      setConfig((prev) => ({ ...prev, ...d.config, githubToken: prev.githubToken }))
    }
  }

  const value = {
    convocantes,
    turnos,
    movimientos,
    config,
    actualizarConfig,
    // convocantes
    crearConvocante,
    actualizarConvocante,
    eliminarConvocante,
    // turnos
    crearTurno,
    actualizarTurno,
    cancelarTurno,
    eliminarTurno,
    finalizarTurno,
    // caja
    agregarMovimiento,
    eliminarMovimiento,
    cobrarCuentaCorriente,
    // backup
    exportarDatos,
    importarDatos,
    // helpers
    nombreConvocante,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData debe usarse dentro de <DataProvider>')
  return ctx
}
