import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { penetrationsAPI } from '../services/api'
import { X } from 'lucide-react'

export default function EditPenModal({ pen, contractors, onClose }) {
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    deck: pen.deck || '',
    location: pen.location || '',
    pen_id: pen.pen_id || '',
    status: pen.status || 'not_started',
    diameter: pen.diameter || '',
    notes: pen.notes || '',
    contractor_id: pen.contractor_id || ''
  })

  const [error, setError] = useState('')

  const updateMutation = useMutation({
    mutationFn: (data) => penetrationsAPI.update(pen.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['penetrations'])
      queryClient.invalidateQueries(['dashboard'])
      onClose()
    },
    onError: (error) => {
      setError(error.response?.data?.error || 'Failed to update penetration')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => penetrationsAPI.delete(pen.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['penetrations'])
      queryClient.invalidateQueries(['dashboard'])
      onClose()
    },
    onError: (error) => {
      setError(error.response?.data?.error || 'Failed to delete penetration')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!formData.deck || !formData.location || !formData.pen_id || !formData.contractor_id) {
      setError('Please fill in all required fields')
      return
    }

    updateMutation.mutate(formData)
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this penetration? This cannot be undone.')) {
      deleteMutation.mutate()
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Penetration</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deck */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deck *
              </label>
              <input
                type="text"
                name="deck"
                value={formData.deck}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="e.g., 6"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="e.g., Frame 92, Port Side"
                required
              />
            </div>

            {/* Pen ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pen ID *
              </label>
              <input
                type="text"
                name="pen_id"
                value={formData.pen_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="e.g., PEN-001"
                required
              />
            </div>

            {/* Diameter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diameter (mm)
              </label>
              <input
                type="text"
                name="diameter"
                value={formData.diameter}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="e.g., 50"
              />
            </div>

            {/* Contractor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contractor *
              </label>
              <select
                name="contractor_id"
                value={formData.contractor_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              >
                <option value="">Select contractor...</option>
                {contractors.map(contractor => (
                  <option key={contractor.id} value={contractor.id}>
                    {contractor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              >
                <option value="not_started">Not Started</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="verified">Verified</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Additional notes..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Pen'}
            </button>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}