import { daysUntilEmbarkation } from '../utils/helpers'

export default function ProjectHeader({ project }) {
  if (!project) return null

  const daysLeft = daysUntilEmbarkation(project.embarkation_date)

  return (
    <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-700 text-white px-6 py-8 rounded-lg shadow-lg mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2 font-display">{project.ship_name}</h1>
          <p className="text-navy-200 text-lg">
            {project.name} • {project.drydock_location}
          </p>
        </div>
        <div className="text-right">
          <div className="text-navy-300 text-sm mb-1">Embarkation in</div>
          <div className="text-4xl font-bold">{daysLeft} days</div>
        </div>
      </div>
    </div>
  )
}