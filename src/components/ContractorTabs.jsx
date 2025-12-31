export default function ContractorTabs({ contractors, activeContractor, onSelectContractor }) {
  return (
    <div className="bg-white border-b border-gray-200 overflow-x-auto">
      <div className="flex gap-1 px-6 min-w-max">
        <button
          onClick={() => onSelectContractor(null)}
          className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeContractor === null
              ? 'border-primary text-primary bg-blue-50'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          All Contractors
        </button>
        {contractors.map((contractor) => (
          <button
            key={contractor.id}
            onClick={() => onSelectContractor(contractor.id)}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeContractor === contractor.id
                ? 'border-primary text-primary bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {contractor.name}
            <span className="ml-2 text-xs text-gray-500">
              ({contractor.total || 0} pens)
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}