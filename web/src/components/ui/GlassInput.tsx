import type { InputHTMLAttributes } from 'react'

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: string
}

export function GlassInput({ label, error, id, className = '', ...props }: GlassInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-subtle)' }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200 ${className}`}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '0.5px solid var(--border-card)',
          color: 'var(--text-primary)',
          caretColor: 'var(--accent-light)',
        }}
        onFocus={e => {
          e.currentTarget.style.border = '0.5px solid rgba(123,63,133,0.6)'
          e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-glow)'
        }}
        onBlur={e => {
          e.currentTarget.style.border = '0.5px solid var(--border-card)'
          e.currentTarget.style.boxShadow = 'none'
        }}
        {...props}
      />
      {error && (
        <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>
      )}
    </div>
  )
}
