export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div
        role="status"
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'rgba(123,63,133,0.4)', borderTopColor: '#7B3F85' }}
      />
    </div>
  )
}
