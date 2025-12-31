import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './stores/authStore'

// Pages
import LoginPage from './pages/LoginPage'
import ProjectsPage from './pages/ProjectsPage'
import DashboardPage from './pages/DashboardPage'
import ContractorReportPage from './pages/ContractorReportPage'
import RegistrationPage from './pages/RegistrationPage'
import PendingApprovalsPage from './pages/PendingApprovalsPage'
import ContractorLinksPage from './pages/ContractorLinksPage'

// Protected Route Component
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/join/:inviteCode" element={<RegistrationPage />} />
        <Route path="/report/:token" element={<ContractorReportPage />} />
        
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:projectId"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:projectId/approvals"
          element={
            <ProtectedRoute>
              <PendingApprovalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:projectId/contractor-links"
          element={
            <ProtectedRoute>
              <ContractorLinksPage />
            </ProtectedRoute>
          }
        />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App