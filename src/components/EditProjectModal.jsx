import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsAPI } from '../services/api'
import { X } from 'lucide-react'

export default function EditProjectModal({ project, onClose }) {
  const queryClient = useQueryClient()
  
  // Debug: log the project data
  console.log('EditProjectModal received project:', project)
  
  const [formData, setFormData] = useState({
    ship_name: project.ship_name || '',
    name: project.name || '',
    drydock_location: project.drydock_location || '',
    start_date: project.start_date || '',
    embarkation_date: project.embarkation_date || '',
    notes: project.notes || '',
  })
  
  console.log('EditProjectModal formData:', formData)

  const updateMutation = useMutation({
    mutationFn: (data) => projectsAPI.update(project.id, data),
    onSuccess: () => {
      // Invalidate all related queries to refresh UI
      queryClient.invalidateQueries(['projects'])
      queryClient.invalidateQueries(['project', project.id])
      queryClient.invalidateQueries(['dashboard', project.id])
      onClose()
    },
    onError: (error) => {
      alert('Failed to update project: ' + (error.response?.data?.error || error.message))
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Edit Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ship Name *
            </label>
            <input
              type="text"
              value={formData.ship_name}
              onChange={(e) => setFormData({ ...formData, ship_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Drydock Location *
            </label>
            <input
              type="text"
              value={formData.drydock_location}
              onChange={(e) => setFormData({ ...formData, drydock_location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Embarkation Date *
              </label>
              <input
                type="date"
                value={formData.embarkation_date}
                onChange={(e) => setFormData({ ...formData, embarkation_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}