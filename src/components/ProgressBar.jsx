export default function ProgressBar({ percent, label, size = 'md' }) {
  const clamped = Math.min(100, Math.max(0, Math.round(percent)))
  const colorClass =
    clamped === 100 ? 'bg-green-500' :
    clamped >= 75   ? 'bg-church-gold' :
    clamped >= 40   ? 'bg-yellow-400' :
                      'bg-blue-400'

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-4' : 'h-2.5'

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">{label}</span>
          <span className="text-xs font-bold text-gray-700">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${heightClass} overflow-hidden`}>
        <div
          className={`${heightClass} rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
