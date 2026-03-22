interface ErrorBannerProps {
  message: string
  size?: 'sm' | 'xs'
  className?: string
}

export function ErrorBanner({ message, size = 'sm', className = '' }: ErrorBannerProps) {
  const sizeClasses = size === 'xs'
    ? 'text-xs px-3 py-2 rounded-lg'
    : 'text-sm px-4 py-3 rounded-xl'
  return (
    <p
      role="alert"
      className={`${sizeClasses} ${className}`}
      style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}
    >
      {message}
    </p>
  )
}
