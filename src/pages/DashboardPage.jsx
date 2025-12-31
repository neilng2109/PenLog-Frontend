import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import useAuthStore from '../stores/authStore'
import { projectsAPI, penetrationsAPI, dashboardAPI, contractorsAPI, pdfAPI } from '../services/api'
import { Plus, FileText } from 'lucide-react'

// Components
import PenLogLogo from '../components/PenLogLogo'
import ProjectHeader from '../components/ProjectHeader'
import StatCard from '../components/StatCard'
import ContractorTabs from '../components/ContractorTabs'
import PenetrationsTable from '../components/PenetrationsTable'
import CompletionPieChart from '../components/CompletionPieChart'
import PenDetailModal from '../components/PenDetailModal'
import AddPenModal from '../components/AddPenModal'
import ProjectInviteLink from '../components/ProjectInviteLink'

export default function DashboardPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const [activeContractor, setActiveContractor] = useState(null)
  const [selectedPen, setSelectedPen] = useState(null)
  const [showAddPen, setShowAddPen] = useState(false)

  // Use project ID 1 if not specified (for now)
  const currentProjectId = projectId || 1

  // Fetch project details
  const { data: project } = useQuery({
    queryKey: ['project', currentProjectId],
    queryFn: () => projectsAPI.getById(currentProjectId).then(res => res.data),
  })

  // Fetch dashboard data
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard', currentProjectId],
    queryFn: () => projectsAPI.getDashboard(currentProjectId).then(res => res.data),
  })

  // Fetch penetrations
  const { data: penetrations = [] } = useQuery({
    queryKey: ['penetrations', currentProjectId, activeContractor],
    queryFn: () => {
      const params = { project_id: currentProjectId }
      if (activeContractor) params.contractor_id = activeContractor
      return penetrationsAPI.getAll(params).then(res => res.data)
    },
  })

  // Fetch all contractors for the add form
  const { data: allContractors = [] } = useQuery({
    queryKey: ['contractors'],
    queryFn: () => contractorsAPI.getAll().then(res => res.data),
  })

  const stats = dashboardData?.overall || {
    total: 0,
    not_started: 0,
    open: 0,
    closed: 0,
    verified: 0,
    completion_rate: 0,
  }

  const contractors = dashboardData?.by_contractor || []

  const handleExportPDF = async () => {
    try {
      const response = await pdfAPI.exportProject(currentProjectId)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `PenLog_${project?.ship_name?.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export PDF:', error)
      alert('Failed to generate PDF report')
    }
  }

  const handleExportExcel = async () => {
    try {
      const response = await pdfAPI.exportProjectExcel(currentProjectId)
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `PenLog_${project?.ship_name?.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export Excel:', error)
      alert('Failed to generate Excel report')
    }
  }

  const handleExportCompletePackage = async () => {
    try {
      const response = await pdfAPI.exportCompletePackage(currentProjectId)
      const blob = new Blob([response.data], { type: 'application/zip' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `PenLog_${project?.ship_name?.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}_Complete.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export complete package:', error)
      alert('Failed to generate complete package')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-6 py-4 flex justify-between items-center">
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
                onClick={() => navigate(`/project/${projectId}/approvals`)}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Approvals
              </button>
              <button
                onClick={() => navigate(`/project/${projectId}/contractor-links`)}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Contractor Links
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.username}
            </span>
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
      <main className="max-w-[1920px] mx-auto px-6 py-8">
        {/* Project Header */}
        <ProjectHeader project={project} />

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <StatCard
            title="Total Penetrations"
            value={stats.total}
            color="gray"
          />
          <StatCard
            title="Currently Open"
            value={stats.open}
            color="red"
          />
          <StatCard
            title="Pending Verification"
            value={stats.closed}
            color="yellow"
          />
          <StatCard
            title="Verified Complete"
            value={stats.verified}
            color="green"
            subtitle={`${stats.completion_rate}% Complete`}
          />
          <StatCard
            title="Need Photos"
            value={stats.pens_without_photos || 0}
            color="orange"
            subtitle="<2 photos"
          />
        </div>
		
		<div className="mb-6">
          <ProjectInviteLink projectId={projectId} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <CompletionPieChart stats={stats} />
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">By Contractor</h3>
            <div className="space-y-3">
              {contractors.slice(0, 5).map((contractor) => {
                // Calculate completion rate from verified/total
                const completionRate = contractor.total > 0 
                  ? Math.round((contractor.verified / contractor.total) * 100)
                  : 0
                
                return (
                  <div key={contractor.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{contractor.name}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-teal-500 h-2 rounded-full"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {completionRate}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Contractor Tabs with Add Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            <ContractorTabs
              contractors={contractors}
              activeContractor={activeContractor}
              onSelectContractor={setActiveContractor}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportCompletePackage}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
            >
              <FileText className="w-5 h-5" />
              Complete Package
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
            >
              <FileText className="w-5 h-5" />
              Export Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-navy-700 hover:bg-navy-800 text-white font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
            >
              <FileText className="w-5 h-5" />
              Export PDF
            </button>
            <button
              onClick={() => setShowAddPen(true)}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Add New Pen
            </button>
          </div>
        </div>

        {/* Penetrations Table */}
        <div>
          <PenetrationsTable
            data={penetrations}
            onRowClick={setSelectedPen}
          />
        </div>
      </main>

      {/* Pen Detail Modal */}
      {selectedPen && (
        <PenDetailModal
          pen={selectedPen}
          onClose={() => setSelectedPen(null)}
        />
      )}

      {/* Add Pen Modal */}
      {showAddPen && (
        <AddPenModal
          projectId={currentProjectId}
          contractors={allContractors}
          onClose={() => setShowAddPen(false)}
        />
      )}
    </div>
  )
}