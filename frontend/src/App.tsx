import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react'
import { InteractionStatus } from '@azure/msal-browser'
import { graphScopes } from './auth/msalConfig'
import NavBar from './components/NavBar/NavBar'
import ChecklistPage from './pages/ChecklistPage'
import CalendarPage from './pages/CalendarPage'
import LibraryPage from './pages/LibraryPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import ChatWidget from './components/ChatWidget/ChatWidget'
import LoadingSpinner from './components/LoadingSpinner'

function LoginPage() {
  const { instance, inProgress } = useMsal()

  if (inProgress !== InteractionStatus.None) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">HLS</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">HLS New Hire Training</h1>
          <p className="text-gray-500">
            Sign in with your Microsoft 365 account to access your personalized onboarding
            training roadmap.
          </p>
        </div>
        <button
          className="btn-primary w-full"
          onClick={() =>
            instance.loginPopup({ scopes: graphScopes.profile })
              .then(result => {
                if (result?.account) instance.setActiveAccount(result.account)
              })
              .catch(err => alert('Login error: ' + err.message))
          }
        >
          Sign in with Microsoft
        </button>
      </div>
    </div>
  )
}

function App() {
  return (
    <>
      <UnauthenticatedTemplate>
        <LoginPage />
      </UnauthenticatedTemplate>
      <AuthenticatedTemplate>
        <HashRouter>
          <div className="min-h-screen bg-gray-50">
            <NavBar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/" element={<Navigate to="/checklist" replace />} />
                <Route path="/checklist" element={<ChecklistPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
              </Routes>
            </main>
            <ChatWidget />
          </div>
        </HashRouter>
      </AuthenticatedTemplate>
    </>
  )
}

export default App
