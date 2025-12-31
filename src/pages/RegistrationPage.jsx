import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { registrationAPI } from '../services/api'
import PenLogLogo from '../components/PenLogLogo'

export default function RegistrationPage() {
  const { inviteCode } = useParams()
  
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    contact_email: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  // Fetch project details
  const { data: projectData, isLoading, error: projectError } = useQuery({
    queryKey: ['registration-form', inviteCode],
    queryFn: () => registrationAPI.getForm(inviteCode).then(res => res.data),
    retry: 1
  })

  const submitMutation = useMutation({
    mutationFn: (data) => registrationAPI.submit(inviteCode, data),
    onSuccess: () => {
      setSubmitted(true)
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    
    // Validate
    if (!formData.company_name || !formData.contact_person || !formData.contact_email) {
      setError('All fields are required')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.contact_email)) {
      setError('Please enter a valid email address')
      return
    }

    submitMutation.mutate(formData)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex items-center justify-center p-4">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  // Error state
  if (projectError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4 font-display">
            Invalid Invitation
          </h1>
          <p className="text-gray-600">
            This invitation link is invalid or has expired. Please contact the project supervisor for a new link.
          </p>
        </div>
      </div>
    )
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-teal-600 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4 font-display">
            Registration Submitted!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for registering. Your registration has been submitted and is awaiting approval from the project supervisor.
          </p>
          <div className="p-4 bg-teal-50 rounded-lg text-sm text-teal-900 border border-teal-200">
            <p className="font-medium mb-1">What happens next?</p>
            <p>
              Once approved, you will receive a unique access link via WhatsApp or email that will allow you to report penetration status without needing to log in.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const project = projectData?.project

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <PenLogLogo size="xl" showText={false} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 font-display">PenLog</h1>
          <p className="text-navy-300">Contractor Registration</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Project Info */}
          {project && (
            <div className="mb-6 p-4 bg-navy-50 rounded-lg border border-navy-200">
              <div className="text-sm text-navy-600 mb-1">Registering for:</div>
              <div className="font-bold text-navy-900 font-display">{project.ship_name}</div>
              <div className="text-sm text-navy-700">{project.drydock_location}</div>
            </div>
          )}

          <h2 className="text-2xl font-semibold text-gray-900 mb-6 font-display">
            Contractor Information
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company Name */}
            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                id="company_name"
                name="company_name"
                type="text"
                value={formData.company_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="e.g., MIVAN Construction"
                required
                disabled={submitMutation.isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter your company's full name
              </p>
            </div>

            {/* Contact Person */}
            <div>
              <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                id="contact_person"
                name="contact_person"
                type="text"
                value={formData.contact_person}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="e.g., John Smith"
                required
                disabled={submitMutation.isLoading}
              />
            </div>

            {/* Contact Email */}
            <div>
              <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="contact_email"
                name="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="e.g., john@mivan.com"
                required
                disabled={submitMutation.isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="trade">Trade / Specialty *</label>
              <select 
                id="trade" 
                name="trade" 
                value={formData.trade || ''}
                onChange={handleChange}
                required
              >
                <option value="">Select your trade</option>
                <option value="Electrical">Electrical</option>
                <option value="HVAC">HVAC</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Steelwork">Steelwork</option>
                <option value="Joinery">Joinery</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Info Box */}
            <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
              <p className="text-xs text-teal-900">
                <strong>No password required!</strong> Once approved, you'll receive a unique link to report penetration status directly - no login needed.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitMutation.isLoading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {submitMutation.isLoading ? 'Submitting...' : 'Submit Registration'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-navy-300 text-sm">
          <p>&copy; 2025 PenLog. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
 