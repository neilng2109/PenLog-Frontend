import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsAPI, adminAPI } from '../services/api'
import useAuthStore from '../stores/authStore'
import { Plus, Edit2, Archive, Ship, Calendar, MapPin, Users } from 'lucide-react'
import PenLogLogo from '../components/PenLogLogo'
import CreateProjectModal from '../components/CreateProjectModal'
import EditProjectModal from '../components/EditProjectModal'
import AssignSupervisorModal from '../components/AssignSupervisorModal'

export default function ProjectsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const queryClient = useQueryClient()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [assigningProject, setAssigningProject] = useState(null)

  // Check if current user is admin
  const isAdmin = user?.username === 'admin'

  // Fetch all projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.getAll().then(res => res.data),
	
  // Fetch pending access requests count
  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['access-requests-pending'],
    queryFn: () => adminAPI.getAccessRequests('pending').then(res => res.data),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

const pendingCount = pendingRequests.length
	
  })

  // Archive project mutation
  const archiveMutation = useMutation({
    mutationFn: (projectId) => projectsAPI.update(projectId, { status: 'completed' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects'])
    },
  })

  const handleArchive = (project) => {
    if (confirm(`Archive ${project.ship_name}? This will mark it as completed.`)) {
      archiveMutation.mutate(project.id)
    }
  }

  const activeProjects = projects.filter(p => p.status === 'active')
  const completedProjects = projects.filter(p => p.status === 'completed')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
	  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
		<PenLogLogo size="lg" />
		<div className="flex items-center gap-4">
		  <button
			onClick={() => navigate('/admin/access-requests')}
			className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-2 transition-colors"
		  >
			Access Requests
			{pendingCount > 0 && (
			  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
				{pendingCount}
			  </span>
			)}
		  </button>
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with Create Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Drydock Projects</h2>
            <p className="text-gray-600 mt-1">Manage your ship drydock penetration tracking projects</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading projects...</div>
          </div>
        ) : (
          <>
            {/* Active Projects */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Projects</h3>
              {activeProjects.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <Ship className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No active projects</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Create your first project
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeProjects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white rounded-lg border border-gray-200 hover:border-teal-500 hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
                    >
                      {/* Card Header */}
                      <div className="bg-gradient-to-r from-navy-700 to-navy-600 p-4">
                        <h4 className="text-white font-semibold text-lg flex items-center gap-2">
                          <Ship className="w-5 h-5" />
                          {project.ship_name}
                        </h4>
                        <p className="text-navy-200 text-sm mt-1">{project.name}</p>
                      </div>

                      {/* Card Body */}
                      <div className="p-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{project.drydock_location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {project.start_date && new Date(project.start_date).toLocaleDateString()} - {' '}
                              {project.embarkation_date && new Date(project.embarkation_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Days Until Embarkation */}
                        {project.embarkation_date && (
                          <div className="mt-4 p-3 bg-teal-50 rounded-lg">
                            <div className="text-teal-900 font-semibold text-lg">
                              {Math.max(0, Math.ceil((new Date(project.embarkation_date) - new Date()) / (1000 * 60 * 60 * 24)))} days
                            </div>
                            <div className="text-teal-700 text-xs">until embarkation</div>
                          </div>
                        )}

                        {/* Supervisor Info */}
                        {project.supervisor && (
                          <div className="mt-4 p-2 bg-blue-50 rounded border border-blue-200">
                            <div className="text-xs text-blue-700 font-medium flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Supervisor: {project.supervisor.username}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => navigate(`/project/${project.id}`)}
                            className="flex-1 px-3 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded transition-colors"
                          >
                            Open Dashboard
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setAssigningProject(project)
                                }}
                                className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                                title="Assign Supervisor"
                              >
                                <Users className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingProject(project)
                                }}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleArchive(project)
                                }}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                                title="Archive"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Projects */}
            {completedProjects.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Completed Projects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white rounded-lg border border-gray-200 opacity-75 hover:opacity-100 transition-opacity overflow-hidden"
                    >
                      <div className="bg-gray-500 p-4">
                        <h4 className="text-white font-semibold text-lg flex items-center gap-2">
                          <Ship className="w-5 h-5" />
                          {project.ship_name}
                        </h4>
                        <p className="text-gray-200 text-sm mt-1">{project.name}</p>
                      </div>
                      <div className="p-4">
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{project.drydock_location}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/project/${project.id}`)}
                          className="mt-4 w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded transition-colors"
                        >
                          View Archive
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
        />
      )}

      {assigningProject && (
        <AssignSupervisorModal
          project={assigningProject}
          onClose={() => setAssigningProject(null)}
        />
      )}
    </div>
  )
}