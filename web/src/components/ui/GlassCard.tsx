import type { ReactNode, HTMLAttributes } from 'react'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: string
}

export function GlassCard({ children, padding = 'p-5', className = '', ...props }: GlassCardProps) {
  return (
    <div
      className={`relative rounded-2xl ${padding} ${className}`}
      style={{
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border-card)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      {...props}
    >
      {/* Specular highlight */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 40%, transparent 100%)',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
