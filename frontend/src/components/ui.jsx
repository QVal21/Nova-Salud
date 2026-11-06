import { useEffect } from 'react'
import { Search, X } from 'lucide-react'

export const btn = {
  primary:
    'inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-bold text-surface transition-colors hover:bg-brand-deep',
  secondary:
    'inline-flex items-center justify-center gap-2 rounded-2xl bg-surface px-5 py-3 text-sm font-bold text-ink ring-1 ring-line transition-colors hover:bg-brand-tint',
  small:
    'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-brand ring-1 ring-line transition-colors hover:bg-brand-tint',
}

export const inputCls = (error) =>
  `w-full rounded-2xl bg-surface px-4 py-3 text-sm ring-1 outline-none transition-shadow focus:ring-2 ${
    error ? 'ring-danger' : 'ring-line focus:ring-brand'
  }`

export const th = 'py-2.5 pr-4 text-left text-xs font-bold text-muted'
export const td = 'py-3 pr-4'

export function PageHeader({ description, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <p className="max-w-2xl text-sm font-medium text-muted">{description}</p>
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </div>
  )
}

export function Panel({ className = '', children }) {
  return <section className={`rounded-[28px] bg-surface p-6 ring-1 ring-line ${className}`}>{children}</section>
}

const badgeStyles = {
  danger: 'bg-danger-tint text-danger-deep',
  warning: 'bg-sun-tint text-sun-deep',
  success: 'bg-brand-tint text-brand-deep',
  info: 'bg-sky/30 text-sky-deep',
  neutral: 'bg-page text-ink ring-1 ring-line',
}

export function Badge({ variant = 'neutral', children }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${badgeStyles[variant]}`}>
      {children}
    </span>
  )
}

export function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-semibold text-danger">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs font-medium text-muted">{hint}</p>
      )}
    </div>
  )
}

export function SearchBox({ value, onChange, placeholder, inputRef, onKeyDown, autoFocus, className = '' }) {
  return (
    <label
      className={`flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 ring-1 ring-line focus-within:ring-2 focus-within:ring-brand ${className}`}
    >
      <Search className="size-4 shrink-0 text-muted" />
      <input
        ref={inputRef}
        type="search"
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
      />
    </label>
  )
}

export function Chips({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            value === o.value ? 'bg-brand text-surface' : 'bg-surface text-ink ring-1 ring-line hover:bg-brand-tint'
          }`}
        >
          {o.label}
          {o.count != null && <span className="ml-1.5 font-num">{o.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function Segmented({ options, value, onChange }) {
  return (
    <div className="grid gap-1 rounded-2xl bg-page p-1 ring-1 ring-line" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-xl px-2 py-2 text-sm font-semibold transition-colors ${
            value === o.value ? 'bg-surface text-brand-deep ring-1 ring-line' : 'text-muted hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function MetricStrip({ items }) {
  return (
    <section
      className={`grid grid-cols-2 gap-px overflow-hidden rounded-[28px] bg-line ring-1 ring-line ${
        items.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
      }`}
    >
      {items.map((m) => (
        <div key={m.label} className="bg-surface p-6">
          <p className="text-sm font-semibold text-muted">{m.label}</p>
          <p className="mt-2 font-num text-2xl font-semibold sm:text-3xl">{m.valor}</p>
          {m.nota && <p className="mt-1 text-xs font-medium text-muted">{m.nota}</p>}
        </div>
      ))}
    </section>
  )
}

export function EmptyRow({ cols, text }) {
  return (
    <tr>
      <td colSpan={cols} className="py-10 text-center text-sm font-medium text-muted">
        {text}
      </td>
    </tr>
  )
}

export function Modal({ open, title, onClose, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const cerrar = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', cerrar)
    return () => window.removeEventListener('keydown', cerrar)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-6" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-surface p-6 sm:rounded-[28px] ${
          size === 'lg' ? 'max-w-2xl' : 'max-w-lg'
        }`}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold">{title}</h2>
          <button onClick={onClose} className="rounded-xl p-2 text-muted hover:bg-page hover:text-ink" aria-label="Cerrar">
            <X className="size-5" />
          </button>
        </div>
        {children}
        {footer && <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div>}
      </div>
    </div>
  )
}
