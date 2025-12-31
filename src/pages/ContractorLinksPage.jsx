import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuthStore from '../stores/authStore'
import { Link2, Copy, RefreshCw, Check } from 'lucide-react'
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

  // Fetch contractor links
  const { data: links = [], isLoading } = useQuery({
    queryKey: ['contractor-links', currentProjectId],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `http://localhost:5000/api/contractors/project/${currentProjectId}/access-links`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data
    },
  })

  // Regenerate link mutation
  const regenerateMutation = useMutation({
    mutationFn: async (contractorId) => {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `http://localhost:5000/api/contractors/project/${currentProjectId}/contractor/${contractorId}/regenerate-link`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
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

  const handleRegenerate = (contractorId, contractorName) => {
    if (confirm(`Regenerate magic link for ${contractorName}? The old link will stop working.`)) {
      regenerateMutation.mutate(contractorId)
    }
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contractor Access Links</h1>
          <p className="text-gray-600">Manage magic links for contractors to access their penetration reports</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading contractor links...</div>
          </div>
        ) : links.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Link2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Contractors</h3>
            <p className="text-gray-500 mb-4">Contractors need to register and be approved before getting access links.</p>
            <button
              onClick={() => navigate('/approvals')}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
            >
              Go to Approvals
            </button>
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
                    <tr key={link.contractor_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{link.contractor_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        {link.magic_link ? (
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-gray-100 px-3 py-1 rounded border border-gray-200 font-mono text-gray-700 max-w-md truncate">
                              {link.magic_link}
                            </code>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">No link generated</span>
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
                              onClick={() => copyToClipboard(link.magic_link, link.contractor_id)}
                              className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
                              title="Copy link"
                            >
                              {copiedToken === link.contractor_id ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleRegenerate(link.contractor_id, link.contractor_name)}
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
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            How to Use Magic Links
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Click the <strong>Copy</strong> button to copy a contractor's magic link</li>
            <li>• Send the link to the contractor via email or messaging app</li>
            <li>• The contractor can access their penetration report without logging in</li>
            <li>• Click <strong>Regenerate</strong> if a link is compromised (old link will stop working)</li>
            <li>• Links never expire unless regenerated or the contractor is removed</li>
          </ul>
        </div>
      </div>
    </div>
  )
}