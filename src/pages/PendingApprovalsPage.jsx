import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuthStore from '../stores/authStore'
import { registrationAPI } from '../services/api'
import { Check, X, Edit2, Copy } from 'lucide-react'
import PenLogLogo from '../components/PenLogLogo'

export default function PendingApprovalsPage() {
  const navigate = useNavigate()
  const { projectId } = useParams()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  
  const currentProjectId = parseInt(projectId) || 1
  
  const [editingId, setEditingId] = useState(null)
  const [editedName, setEditedName] = useState('')
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [magicLink, setMagicLink] = useState(null)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [contractorName, setContractorName] = useState('')

  const queryClient = useQueryClient()

  // Fetch pending registrations for this project
  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['pending-registrations', currentProjectId],
    queryFn: () => registrationAPI.getPending(currentProjectId).then(res => res.data),
    refetchInterval: 10000 // Refresh every 10 seconds
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, company_name }) => 
      registrationAPI.approve(id, { company_name }),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries(['pending-registrations'])
      queryClient.invalidateQueries(['contractors'])
      setEditingId(null)
      
      // Show the magic link in modal
      const accessToken = response.data?.access_token
      if (accessToken) {
        const link = `${window.location.origin}/report/${accessToken.token}`
        setMagicLink(link)
        setContractorName(variables.company_name)
        setShowLinkModal(true)
      }
    }
  })

  const copyLink = () => {
    navigator.clipboard.writeText(magicLink)
    alert('Link copied to clipboard!')
  }

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => 
      registrationAPI.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-registrations'])
      setRejectingId(null)
      setRejectReason('')
    }
  })

  const handleApprove = (registration) => {
    const name = editingId === registration.id ? editedName : registration.company_name
    approveMutation.mutate({ id: registration.id, company_name: name })
  }

  const handleReject = (id) => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }
    rejectMutation.mutate({ id, reason: rejectReason })
  }

  const startEdit = (registration) => {
    setEditingId(registration.id)
    setEditedName(registration.company_name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditedName('')
  }

  const copyAccessLink = (token) => {
    const link = `${window.location.origin}/report/${token}`
    navigator.clipboard.writeText(link)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <PenLogLogo size="md" />
            <nav className="flex gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                ← Projects
              </button>
              <button
                onClick={() => navigate(`/project/${currentProjectId}`)}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate(`/project/${currentProjectId}/approvals`)}
                className="text-sm font-medium text-teal-600"
              >
                Approvals
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
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Pending Contractor Approvals</h2>
          <p className="text-gray-600 mt-2">
            Review and approve contractor registrations for P&O Ventura drydock
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading registrations...</div>
          </div>
        ) : registrations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">✓</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Pending Approvals
            </h3>
            <p className="text-gray-600">
              All contractor registrations have been processed.
            </p>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg inline-block">
              <p className="text-sm text-blue-900">
                <strong>Share invitation link:</strong><br />
                <code className="text-xs">http://localhost:3000/join/1</code>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((registration) => (
              <div
                key={registration.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* Company Name */}
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-500">Company Name</label>
                      {editingId === registration.id ? (
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="mt-1 w-full max-w-md px-3 py-2 border border-primary rounded-lg focus:ring-2 focus:ring-primary"
                          autoFocus
                        />
                      ) : (
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-lg font-semibold text-gray-900">
                            {registration.company_name}
                          </span>
                          <button
                            onClick={() => startEdit(registration)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Edit company name"
                          >
                            <Edit2 className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Contact Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Contact Person</label>
                        <div className="mt-1 text-gray-900">{registration.contact_person}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <div className="mt-1 text-gray-900">{registration.contact_email}</div>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="text-xs text-gray-500">
                      Submitted: {new Date(registration.created_at).toLocaleString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    {editingId === registration.id ? (
                      <>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleApprove(registration)}
                          disabled={approveMutation.isLoading}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          {approveMutation.isLoading ? 'Approving...' : 'Approve'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setRejectingId(registration.id)}
                          className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(registration)}
                          disabled={approveMutation.isLoading}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          {approveMutation.isLoading ? 'Approving...' : 'Approve'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Rejection Form */}
                {rejectingId === registration.id && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <label className="block text-sm font-medium text-red-900 mb-2">
                      Rejection Reason
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Why are you rejecting this registration?"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => {
                          setRejectingId(null)
                          setRejectReason('')
                        }}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReject(registration.id)}
                        disabled={rejectMutation.isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
                      >
                        {rejectMutation.isLoading ? 'Rejecting...' : 'Confirm Rejection'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Magic Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Contractor Approved!
              </h2>
              <p className="text-gray-600">
                {contractorName} can now report penetration status
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Magic Link (No login required)
              </label>
              <div className="bg-white p-3 rounded border border-blue-300 font-mono text-sm break-all">
                {magicLink}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={copyLink}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Copy className="w-5 h-5" />
                Copy Link to Clipboard
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Hi! Here's your PenLog access link for ${contractorName}:\n\n${magicLink}\n\nClick this link to report penetration status. No login required!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Send via WhatsApp
              </button>

              <button
                onClick={() => setShowLinkModal(false)}
                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}