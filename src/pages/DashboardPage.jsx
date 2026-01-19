import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import useAuthStore from '../stores/authStore'
import { projectsAPI, penetrationsAPI, dashboardAPI, contractorsAPI, pdfAPI } from '../services/api'
import { Plus, FileText, Menu, X } from 'lucide-react'

// Components
import PenLogLogo from '../components/PenLogLogo'
import ProjectHeader from '../components/ProjectHeader'
import StatCard from '../components/StatCard'
import ContractorTabs from '../components/ContractorTabs'
import PenetrationsTable from '../components/PenetrationsTable'
import CompletionPieChart from '../components/CompletionPieChart'
import PenDetailModal from '../components/PenDetailModal'
import AddPenModal from '../components/AddPenModal'
import DemoMode from '../components/DemoMode'

export default function DashboardPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const [activeContractor, setActiveContractor] = useState(null)
  const [selectedPen, setSelectedPen] = useState(null)
  const [showAddPen, setShowAddPen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Demo mode state
  const [demoMode, setDemoMode] = useState(false)
  const [demoPenetrations, setDemoPenetrations] = useState([])

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

  // Keyboard shortcut for demo mode (Shift+D)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.shiftKey && e.key === 'D') {
        setDemoMode(prev => !prev)
        if (!demoMode) {
          // Initialize demo with current penetrations
          setDemoPenetrations(penetrations)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [demoMode, penetrations])

  // Force re-render when demo penetrations change (for live stats updates)
  useEffect(() => {
    if (demoMode) {
      // This will trigger stats recalculation
      const timer = setTimeout(() => {}, 0);
      return () => clearTimeout(timer);
    }
  }, [demoPenetrations, demoMode])

  // Handle demo updates (both updates and new pens)
  const handleDemoUpdate = (updatedPen) => {
    setDemoPenetrations(prev => {
      // Check if pen exists
      const existingIndex = prev.findIndex(p => p.id === updatedPen.id);
      
      if (existingIndex >= 0) {
        // Update existing pen
        return prev.map(p => p.id === updatedPen.id ? updatedPen : p);
      } else {
        // Add new pen
        return [...prev, updatedPen];
      }
    });
  }

  // Use demo data when demo mode is active
  const displayPenetrations = demoMode ? demoPenetrations : penetrations

  // Calculate stats from demo data or use API data
  const calculateStats = (pens) => {
    const total = pens.length;
    const not_started = pens.filter(p => p.status === 'not_started').length;
    const open = pens.filter(p => p.status === 'open').length;
    const closed = pens.filter(p => p.status === 'closed').length;
    const verified = pens.filter(p => p.status === 'verified').length;
    const pens_without_photos = pens.filter(p => (p.photo_count || 0) < 2).length;
    const completion_rate = total > 0 ? Math.round((verified / total) * 100) : 0;
    
    return {
      total,
      not_started,
      open,
      closed,
      verified,
      pens_without_photos,
      completion_rate
    };
  };

  // Calculate contractor stats from demo data
  const calculateContractorStats = (pens) => {
    const contractorMap = {};
    
    pens.forEach(pen => {
      const name = pen.contractor_name || 'Unknown';
      if (!contractorMap[name]) {
        contractorMap[name] = {
          id: name,
          name: name,
          total: 0,
          not_started: 0,
          open: 0,
          closed: 0,
          verified: 0
        };
      }
      
      contractorMap[name].total++;
      contractorMap[name][pen.status]++;
    });
    
    return Object.values(contractorMap);
  };

  const stats = demoMode 
    ? calculateStats(demoPenetrations)
    : (dashboardData?.overall || {
        total: 0,
        not_started: 0,
        open: 0,
        closed: 0,
        verified: 0,
        completion_rate: 0,
      });

  const contractors = demoMode
    ? calculateContractorStats(demoPenetrations)
    : (dashboardData?.by_contractor || []);

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
	  const blob = new Blob([response.data], { 
	    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
	  })
	  const url = window.URL.createObjectURL(blob)
  	  const link = document.createElement('a')
	  link.href = url
	  link.download = `PenLog_${project?.ship_name?.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}_Complete.xlsx`
	  document.body.appendChild(link)
	  link.click()
	  document.body.removeChild(link)
	  window.URL.revokeObjectURL(url)
	} catch (error) {
	  console.error('Failed to export complete package:', error)
	  alert('Failed to generate complete package')
	}
  }

  const handleNavClick = (path) => {
    navigate(path)
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <PenLogLogo size="md" />
            </div>

            {/* Desktop Navigation */}
			<nav className="hidden md:flex gap-3">
			  <button
				onClick={() => navigate('/')}
				className="px-4 py-2 text-base font-semibold text-gray-700 hover:text-white hover:bg-gray-700 rounded-lg transition-all border-2 border-gray-300 hover:border-gray-700"
			  >
				← Projects
			  </button>
			  
			  {user?.role === 'admin' && (
				<button
				  onClick={() => navigate('/admin/access-requests')}
				  className="px-4 py-2 text-base font-semibold text-orange-700 hover:text-white hover:bg-orange-600 rounded-lg transition-all border-2 border-orange-500 hover:border-orange-600"
				>
				  Access Requests
				</button>
			  )}
			  
			  <button
				onClick={() => navigate(`/project/${projectId}/contractor-links`)}
				className="px-4 py-2 text-base font-semibold text-teal-700 hover:text-white hover:bg-teal-600 rounded-lg transition-all border-2 border-teal-500 hover:border-teal-600"
			  >
				Contractor Access
			  </button>
			</nav>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.username}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-3">
                <button
                  onClick={() => handleNavClick('/')}
                  className="text-left px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  ← Projects
                </button>
				
				{user?.role === 'admin' && (
				  <button
					onClick={() => navigate('/admin/access-requests')}
					className="text-left px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
				  >
					Access Requests
				  </button>
				)}
				
                <button
                  onClick={() => handleNavClick(`/project/${projectId}/contractor-links`)}
                  className="text-left px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Contractor Access
                </button>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="px-4 py-2 text-sm text-gray-600">
                    {user?.username}
                  </div>
                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Project Header */}
        <ProjectHeader project={project} />

        {/* Stats Cards - responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
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
		

        {/* Charts Row - stack on mobile, side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
          <CompletionPieChart stats={stats} />
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
		  <div className="mb-4">
			<h3 className="text-base md:text-lg font-semibold text-gray-900">By Contractor</h3>
			<p className="text-sm text-gray-500 mt-1">Penetration completion rates</p>
		  </div>
		  <div className="space-y-3">
               {contractors.map((contractor) => {
                const completionRate = contractor.total > 0 
                  ? Math.round((contractor.verified / contractor.total) * 100)
                  : 0
        
        return (
          <div key={contractor.id} className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-gray-700 truncate flex-shrink min-w-0">
              {contractor.name}
            </span>
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <div className="w-20 md:w-32 bg-red-400 rounded-full h-2">
				  <div
					className="bg-teal-500 h-2 rounded-full"
					style={{ width: `${completionRate}%` }}
				  />
				</div>
              <span className="text-sm text-gray-600 w-10 md:w-12 text-right">
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
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          <div className="flex-1 overflow-x-auto">
            <ContractorTabs
              contractors={contractors}
              activeContractor={activeContractor}
              onSelectContractor={setActiveContractor}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportCompletePackage}
              className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg hover:shadow-xl"
            >
              <FileText className="w-4 md:w-5 h-4 md:h-5" />
              <span className="hidden sm:inline">Complete Package</span>
              <span className="sm:hidden">Package</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg hover:shadow-xl"
            >
              <FileText className="w-4 md:w-5 h-4 md:h-5" />
              <span className="hidden sm:inline">Export Excel</span>
              <span className="sm:hidden">Excel</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-navy-700 hover:bg-navy-800 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg hover:shadow-xl"
            >
              <FileText className="w-4 md:w-5 h-4 md:h-5" />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button
              onClick={() => setShowAddPen(true)}
              className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 md:w-5 h-4 md:h-5" />
              <span className="hidden sm:inline">Add New Pen</span>
              <span className="sm:hidden">Add Pen</span>
            </button>
          </div>
        </div>

        {/* Penetrations Table */}
        <div>
          <PenetrationsTable
            data={displayPenetrations}
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

      {/* Demo Mode */}
      <DemoMode
        penetrations={displayPenetrations}
        onUpdate={handleDemoUpdate}
        isActive={demoMode}
        onToggle={() => setDemoMode(!demoMode)}
      />
    </div>
  )
}