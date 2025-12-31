import { useState } from 'react'
import { X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { penetrationsAPI } from '../services/api'

export default function AddPenModal({ projectId, contractors, onClose }) {
  const [formData, setFormData] = useState({
    pen_id: '',
    deck: '',
    fire_zone: '',
    frame: '',
    location: '',
    pen_type: '',
    size: '',
    contractor_id: '',
    priority: 'routine',
    notes: ''
  })
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data) => penetrationsAPI.create({ ...data, project_id: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['penetrations'])
      queryClient.invalidateQueries(['dashboard'])
      onClose()
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to create penetration')
      setIsSubmitting(false)
    },
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    
    // Validate required fields
    if (!formData.pen_id || !formData.deck) {
      setError('Pen ID and Deck are required')
      setIsSubmitting(false)
      return
    }
    
    createMutation.mutate(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Add New Penetration</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Pen ID - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pen ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pen_id"
                value={formData.pen_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., 001"
                required
              />
            </div>

            {/* Deck - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deck <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="deck"
                value={formData.deck}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Deck 5"
                required
              />
            </div>

            {/* Fire Zone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fire Zone
              </label>
              <input
                type="text"
                name="fire_zone"
                value={formData.fire_zone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., FZ-3"
              />
            </div>

            {/* Frame */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frame
              </label>
              <input
                type="text"
                name="frame"
                value={formData.frame}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., 42"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Engine Room"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                name="pen_type"
                value={formData.pen_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select type...</option>
                <option value="MCT">MCT</option>
                <option value="ROXTEC">Roxtec</option>
                <option value="GK">GK</option>
                <option value="Navicross">Navicross</option>
                <option value="Fire Seal">Fire Seal</option>
                <option value="BRATTBERG">Brattberg</option>
              </select>
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size
              </label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., 100mm"
              />
            </div>

            {/* Contractor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contractor
              </label>
              <select
                name="contractor_id"
                value={formData.contractor_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select contractor...</option>
                {contractors.map((contractor) => (
                  <option key={contractor.id} value={contractor.id}>
                    {contractor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="routine">Routine</option>
                <option value="important">Important</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Any additional notes..."
            />
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Penetration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}