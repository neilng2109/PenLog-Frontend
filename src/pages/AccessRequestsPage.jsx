import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../services/api'
import useAuthStore from '../stores/authStore'
import { Check, X, AlertCircle, Copy } from 'lucide-react'
import { formatDate } from '../utils/helpers'
import PenLogLogo from '../components/PenLogLogo'

export default function AccessRequestsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const queryClient = useQueryClient()

  const [statusFilter, setStatusFilter] = useState('pending')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [approvedPassword, setApprovedPassword] = useState(null)

  // Fetch access requests
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['access-requests', statusFilter],
    queryFn: () => adminAPI.getAccessRequests(statusFilter).then(res => res.data),
  })

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (requestId) => adminAPI.approveAccessRequest(requestId),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['access-requests'])
      setSelectedRequest(null)
      setApprovedPassword({
        email: response.data.user.email,
        password: response.data.temporary_password
      })
    },
    onError: (error) => {
      alert(error.response?.data?.error || 'Failed to approve request')
    }
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ requestId, reason }) => adminAPI.rejectAccessRequest(requestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['access-requests'])
      setSelectedRequest(null)
    },
    onError: (error) => {
      alert(error.response?.data?.error || 'Failed to reject request')
    }
  })

  const handleApprove = (request) => {
    if (confirm(`Approve access for ${request.name} (${request.email})?`)) {
      approveMutation.mutate(request.id)
    }
  }

  const handleReject = (request) => {
    const reason = prompt('Reason for rejection (optional):')
    if (reason !== null) {
      rejectMutation.mutate({ requestId: request.id, reason })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <PenLogLogo size="md" />
            <nav className="flex gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                ← Projects
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.username}</span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Requests</h1>
          <p className="text-gray-600">Manage user access requests from the landing page</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-8">
            {['pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  statusFilter === status
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {status}
              </button>
            ))}
          </nav>
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No {statusFilter} access requests</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Drydock Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Submitted</th>
                  {statusFilter === 'pending' && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {request.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {request.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {request.company}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {request.role}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {request.drydock_date || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(request.created_at)}
                    </td>
                    {statusFilter === 'pending' && (
                      <td className="px-6 py-4 text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(request)}
                            disabled={approveMutation.isLoading}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded flex items-center gap-1 disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request)}
                            disabled={rejectMutation.isLoading}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded flex items-center gap-1 disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Info Box */}
        {statusFilter === 'pending' && requests.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Important:</p>
                <p>When you approve a request, a temporary password will be generated. Make sure to copy it and send it to the user via email!</p>
              </div>
            </div>
          </div>
        )}
      </main>
	  
	  </main>

      {/* Password Display Modal */}
      {approvedPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">✅ User Approved!</h3>
            
            <div className="space-y-3 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Username / Email:</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={approvedPassword.email}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-50 font-mono text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(approvedPassword.email)
                      alert('Email copied!')
                    }}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Temporary Password:</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={approvedPassword.password}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded bg-yellow-50 font-mono text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(approvedPassword.password)
                      alert('Password copied!')
                    }}
                    className="px-3 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded flex items-center gap-1"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
              <p className="text-sm text-blue-900">
                <strong>Important:</strong> Send these credentials to the user via email. They should change their password after first login.
              </p>
            </div>
            
            <button
              onClick={() => setApprovedPassword(null)}
              className="w-full px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}