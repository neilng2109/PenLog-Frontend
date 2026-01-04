import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { projectsAPI } from '../services/api'
import { X, Users } from 'lucide-react'
import axios from 'axios'

export default function AssignSupervisorModal({ project, onClose }) {
  const queryClient = useQueryClient()
  const [selectedSupervisorId, setSelectedSupervisorId] = useState(project.supervisor_id || '')

    // Fetch all supervisors
	const { data: supervisors = [] } = useQuery({
	  queryKey: ['supervisors'],
	  queryFn: () => projectsAPI.getSupervisors().then(res => res.data),
  })

  const assignMutation = useMutation({
    mutationFn: async (supervisorId) => {
      const token = localStorage.getItem('token')
      const response = await axios.put(
        `http://localhost:5000/api/projects/${project.id}/assign-supervisor`,
        { supervisor_id: supervisorId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['projects'])
      queryClient.invalidateQueries(['project', project.id])
      onClose()
    },
    onError: (error) => {
      alert('Failed to assign supervisor: ' + (error.response?.data?.error || error.message))
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedSupervisorId) {
      assignMutation.mutate(parseInt(selectedSupervisorId))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <h2 className="text-xl font-semibold text-gray-900">Assign Supervisor</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2">{project.ship_name}</h3>
            <p className="text-sm text-gray-600">{project.name}</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Supervisor *
            </label>
            <select
              value={selectedSupervisorId}
              onChange={(e) => setSelectedSupervisorId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="">-- Select a supervisor --</option>
              {supervisors.map((supervisor) => (
                <option key={supervisor.id} value={supervisor.id}>
                  {supervisor.username} ({supervisor.email})
                </option>
              ))}
            </select>
            {project.supervisor && (
              <p className="mt-2 text-sm text-gray-500">
                Currently assigned to: <span className="font-medium">{project.supervisor.username}</span>
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assignMutation.isPending}
              className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assignMutation.isPending ? 'Assigning...' : 'Assign Supervisor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}