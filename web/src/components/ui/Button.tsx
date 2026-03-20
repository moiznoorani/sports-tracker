import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'glass' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-3.5 text-sm',
    lg: 'px-6 py-4 text-base',
  }

  const base = `
    relative inline-flex items-center justify-center gap-2 font-semibold
    rounded-xl transition-all duration-150 select-none
    ${fullWidth ? 'w-full' : ''}
    ${sizes[size]}
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.97]'}
    ${className}
  `

  if (variant === 'primary') {
    return (
      <button
        disabled={disabled || loading}
        className={base}
        style={{
          background: 'linear-gradient(135deg, #7B3F85, #9B5AA6)',
          color: '#fff',
          boxShadow: disabled ? 'none' : '0 4px 20px rgba(123,63,133,0.4)',
        }}
        {...props}
      >
        {loading ? <Spinner /> : children}
      </button>
    )
  }

  if (variant === 'glass') {
    return (
      <button
        disabled={disabled || loading}
        className={base}
        style={{
          background: 'var(--bg-card)',
          border: '0.5px solid var(--border-card)',
          color: 'var(--text-primary)',
          backdropFilter: 'blur(20px)',
        }}
        {...props}
      >
        {loading ? <Spinner /> : children}
      </button>
    )
  }

  return (
    <button
      disabled={disabled || loading}
      className={base}
      style={{ color: 'var(--accent-light)', background: 'transparent' }}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}

function Spinner() {
  return (
    <div
      className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
      style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'transparent' }}
    />
  )
}
