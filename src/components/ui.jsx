// Componentes de interfaz reutilizables.

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-verde-100 bg-white px-5 py-4">
          <h2 className="text-lg font-semibold text-verde-900">{title}</h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-verde-700 hover:bg-verde-50"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function Boton({
  children,
  variante = 'primario',
  className = '',
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed'
  const variantes = {
    primario: 'bg-verde-700 text-white hover:bg-verde-900',
    secundario: 'bg-verde-100 text-verde-900 hover:bg-verde-300',
    fantasma: 'bg-transparent text-verde-700 hover:bg-verde-50',
    peligro: 'bg-red-100 text-red-700 hover:bg-red-200',
  }
  return (
    <button type={type} className={`${base} ${variantes[variante]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Campo({ label, children, hint }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-sm font-medium text-verde-900">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-verde-700/70">{hint}</span>}
    </label>
  )
}

const inputBase =
  'w-full min-w-0 box-border rounded-xl border border-verde-100 bg-verde-50/40 px-3 py-2.5 text-verde-900 outline-none placeholder:text-verde-700/40 focus:border-verde-500 focus:bg-white'

export function Input(props) {
  return <input className={inputBase} {...props} />
}

export function TextArea(props) {
  return <textarea className={`${inputBase} min-h-[80px] resize-y`} {...props} />
}

export function Select({ children, ...props }) {
  return (
    <select className={inputBase} {...props}>
      {children}
    </select>
  )
}

export function Badge({ children, color = 'verde' }) {
  const colores = {
    verde: 'bg-verde-100 text-verde-900',
    amber: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-700',
    gris: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colores[color]}`}>
      {children}
    </span>
  )
}

export function Vacio({ icono = '🌿', titulo, children }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-verde-300 bg-white/50 px-6 py-14 text-center">
      <div className="mb-2 text-4xl">{icono}</div>
      <p className="font-medium text-verde-900">{titulo}</p>
      {children && <p className="mt-1 text-sm text-verde-700">{children}</p>}
    </div>
  )
}
