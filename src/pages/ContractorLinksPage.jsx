import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuthStore from '../stores/authStore'
import { Link2, Copy, RefreshCw, Check, Plus, X } from 'lucide-react'
import PenLogLogo from '../components/PenLogLogo'
import axios from 'axios'

export default function ContractorLinksPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const queryClient = useQueryClient()
  
  const currentProjectId = projectId || 1
  const [copiedToken, setCopiedToken] = useState(null)
  const [showNewLinkForm, setShowNewLinkForm] = useState(false)
  const [newLinkForm, setNewLinkForm] = useState({
    contractor_name: '',
    contact_person: '',
    contact_email: ''
  })

  // Fetch contractor links
  const { data: links = [], isLoading } = useQuery({
    queryKey: ['contractor-links', currentProjectId],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/contractors/project/${currentProjectId}/access-links`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data
    },
  })

  // Generate link mutation - UNIFIED ENDPOINT
  const generateMutation = useMutation({
    mutationFn: async (formData) => {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/contractors/generate-link`,
        {
          project_id: currentProjectId,
          contractor_name: formData.contractor_name,
          contact_person: formData.contact_person,
          contact_email: formData.contact_email
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contractor-links', currentProjectId])
      setShowNewLinkForm(false)
      setNewLinkForm({ contractor_name: '', contact_person: '', contact_email: '' })
    },
    onError: (error) => {
      alert('Failed to generate link: ' + (error.response?.data?.error || error.message))
    },
  })

  // Regenerate link mutation
  const regenerateMutation = useMutation({
    mutationFn: async (token) => {
      const authToken = localStorage.getItem('token')
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/contractors/project/${currentProjectId}/token/${token}/regenerate`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contractor-links', currentProjectId])
    },
    onError: (error) => {
      alert('Failed to regenerate link: ' + (error.response?.data?.error || error.message))
    },
  })

  const copyToClipboard = (link, contractorId) => {
    navigator.clipboard.writeText(link).then(() => {
      setCopiedToken(contractorId)
      setTimeout(() => setCopiedToken(null), 2000)
    })
  }

  const handleRegenerate = (token, contractorName) => {
    if (confirm(`Regenerate magic link for ${contractorName}? The old link will stop working.`)) {
      regenerateMutation.mutate(token)
    }
  }

  const handleGenerateNewLink = (e) => {
    e.preventDefault()
    if (!newLinkForm.contractor_name.trim()) {
      alert('Company name is required')
      return
    }
    generateMutation.mutate(newLinkForm)
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
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.username}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Contractor Access</h1>
            <p className="text-gray-600">Generate magic links for contractors - one link, instant access!</p>
          </div>
          <button
            onClick={() => setShowNewLinkForm(true)}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Generate Link
          </button>
        </div>

        {/* New Link Form Modal */}
        {showNewLinkForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Generate Magic Link</h2>
                <button
                  onClick={() => setShowNewLinkForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleGenerateNewLink} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newLinkForm.contractor_name}
                    onChange={(e) => setNewLinkForm({ ...newLinkForm, contractor_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="e.g., ABC Electrical"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={newLinkForm.contact_person}
                    onChange={(e) => setNewLinkForm({ ...newLinkForm, contact_person: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="e.g., John Smith"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newLinkForm.contact_email}
                    onChange={(e) => setNewLinkForm({ ...newLinkForm, contact_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="e.g., john@abcelectrical.com"
                  />
                </div>

                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-sm text-teal-800">
                  <strong>✓ One Link Only:</strong> Contractor gets instant access when they click the link. No registration, no approval needed!
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewLinkForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generateMutation.isPending}
                    className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {generateMutation.isPending ? 'Generating...' : 'Generate Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading contractor links...</div>
          </div>
        ) : links.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Link2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Links Yet</h3>
            <p className="text-gray-500 mb-4">Click "Generate Link" to create a magic link for a contractor.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contractor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Magic Link
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Used
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {links.map((link) => (
                    <tr key={link.token} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{link.contractor_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        {link.magic_link && (
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-gray-100 px-3 py-1 rounded border border-gray-200 font-mono text-gray-700 max-w-md truncate">
                              {link.magic_link}
                            </code>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {link.last_used ? (
                          new Date(link.last_used).toLocaleDateString() + ' ' + new Date(link.last_used).toLocaleTimeString()
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {link.magic_link && (
                            <button
                              onClick={() => copyToClipboard(link.magic_link, link.token)}
                              className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
                              title="Copy link"
                            >
                              {copiedToken === link.token ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleRegenerate(link.token, link.contractor_name)}
                            disabled={regenerateMutation.isPending}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                            title="Regenerate link"
                          >
                            <RefreshCw className={`w-4 h-4 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-teal-50 border border-teal-200 rounded-lg p-6">
          <h3 className="font-semibold text-teal-900 mb-3 flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            One-Link Workflow
          </h3>
          <ul className="space-y-2 text-sm text-teal-800">
            <li>• Click <strong>Generate Link</strong> and enter contractor details</li>
            <li>• Copy the magic link and send it to the contractor</li>
            <li>• Contractor clicks link → instant access (no approval needed!)</li>
            <li>• Contractor is automatically created on first click</li>
            <li>• Click <strong>Regenerate</strong> if a link is compromised</li>
            <li>• Links expire at project embarkation date</li>
          </ul>
        </div>
      </div>
    </div>
  )
}