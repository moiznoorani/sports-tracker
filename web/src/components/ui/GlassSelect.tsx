import type { SelectHTMLAttributes } from 'react'

interface GlassSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function GlassSelect({ label, id, options, className = '', ...props }: GlassSelectProps) {
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
      <select
        id={id}
        className={`w-full px-4 py-3.5 rounded-xl text-sm outline-none appearance-none transition-all duration-200 ${className}`}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '0.5px solid var(--border-card)',
          color: 'var(--text-primary)',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='rgba(255,241,222,0.4)' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          backgroundSize: '16px',
        }}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} style={{ background: '#111118' }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
