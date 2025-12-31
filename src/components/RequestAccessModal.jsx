import { useState } from 'react'
import { X } from 'lucide-react'
import axios from 'axios'

export default function RequestAccessModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    drydock_date: '',
    ready_to_test: false,
    message: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await axios.post('http://localhost:5000/api/access/request', formData)
      setIsSuccess(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      company: '',
      role: '',
      drydock_date: '',
      ready_to_test: false,
      message: ''
    })
    setIsSuccess(false)
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-navy-900">Request Access to PenLog</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {isSuccess ? (
          // Success State
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
            <p className="text-gray-600 mb-6">
              Thanks for your interest in PenLog. We'll review your request and get back to you within 24 hours.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Check your email for confirmation and next steps.
            </p>
            <button
              onClick={handleClose}
              className="bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition font-semibold"
            >
              Close
            </button>
          </div>
        ) : (
          // Form
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="John Smith"
                  required
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="john@cruiseline.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company / Cruise Line *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., P&O Cruises, Carnival, Royal Caribbean"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select your role</option>
                <option value="Penetration Supervisor">Penetration Supervisor</option>
                <option value="ETO / Electrical Technical Officer">ETO / Electrical Technical Officer</option>
                <option value="Chief Engineer">Chief Engineer</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Contractor">Contractor</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Drydock Date (Optional)
              </label>
              <input
                type="text"
                value={formData.drydock_date}
                onChange={(e) => setFormData({ ...formData, drydock_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., February 2026, Q3 2025"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message (Optional)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Tell us about your drydock operations or any specific needs..."
              />
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="ready_to_test"
                checked={formData.ready_to_test}
                onChange={(e) => setFormData({ ...formData, ready_to_test: e.target.checked })}
                className="mt-1 mr-2 w-4 h-4 text-teal-500 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label htmlFor="ready_to_test" className="text-sm text-gray-700">
                I'm ready to test PenLog on my next drydock
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center pt-2">
              We'll review your request and contact you within 24 hours
            </p>
          </form>
        )}
      </div>
    </div>
  )
}