export default function StatCard({ title, value, color = 'blue', subtitle }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    red: 'bg-red-50 border-red-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    green: 'bg-green-50 border-green-200',
    gray: 'bg-gray-50 border-gray-200',
    orange: 'bg-orange-50 border-orange-200',
  }

  const textClasses = {
    blue: 'text-blue-900',
    red: 'text-red-900',
    yellow: 'text-yellow-900',
    green: 'text-green-900',
    gray: 'text-gray-900',
    orange: 'text-orange-900',
  }

  const subtitleClasses = {
    blue: 'text-blue-700',
    red: 'text-red-700',
    yellow: 'text-yellow-700',
    green: 'text-green-700',
    gray: 'text-gray-700',
    orange: 'text-orange-700',
  }

  return (
    <div className={`rounded-lg border-2 p-6 ${colorClasses[color]}`}>
      <div className={`text-5xl font-bold mb-2 ${textClasses[color]}`}>
        {value}
      </div>
      <div className={`text-sm font-medium ${subtitleClasses[color]}`}>
        {title}
      </div>
      {subtitle && (
        <div className={`text-xs mt-1 ${subtitleClasses[color]}`}>
          {subtitle}
        </div>
      )}
    </div>
  )
}