import { useState } from 'react'
import { X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { penetrationsAPI } from '../services/api'

export default function EditStatusModal({ pen, onClose, onSuccess }) {
  const [status, setStatus] = useState(pen.status)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: (data) => penetrationsAPI.updateStatus(pen.id, data.status, data.notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['penetrations'])
      queryClient.invalidateQueries(['dashboard'])
      onSuccess?.()
      onClose()
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to update status')
      setIsSubmitting(false)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    
    updateMutation.mutate({ status, notes })
  }

  const statusOptions = [
    { value: 'not_started', label: 'Not Started', color: 'gray' },
    { value: 'open', label: 'Open', color: 'red' },
    { value: 'closed', label: 'Closed', color: 'blue' },
    { value: 'verified', label: 'Verified', color: 'green' },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Update Status - Pen {pen.pen_id}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Current Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
            <div className="font-medium text-gray-700 mb-1">Current Status:</div>
            <div className="text-gray-900 capitalize">{pen.status.replace('_', ' ')}</div>
          </div>

          {/* Status Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status
            </label>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    status === option.value
                      ? 'border-primary bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={status === option.value}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mr-3"
                  />
                  <span className="font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Add any notes about this status change..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
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
              {isSubmitting ? 'Updating...' : status !== pen.status ? 'Update Status' : 'Add Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}