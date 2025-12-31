export default function PenLogLogo({ size = 'md', showText = true, className = '' }) {
  const sizes = {
    sm: { box: 'w-8 h-8', text: 'text-lg', logoText: 'text-base' },
    md: { box: 'w-10 h-10', text: 'text-xl', logoText: 'text-xl' },
    lg: { box: 'w-12 h-12', text: 'text-2xl', logoText: 'text-2xl' },
    xl: { box: 'w-16 h-16', text: 'text-3xl', logoText: 'text-3xl' },
  }

  const { box, text, logoText } = sizes[size]

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${box} bg-teal-500 rounded-lg flex items-center justify-center`}>
        <span className={`text-white font-bold ${text}`}>P</span>
      </div>
      {showText && (
        <span className={`${logoText} font-bold text-navy-900`}>PenLog</span>
      )}
    </div>
  )
}