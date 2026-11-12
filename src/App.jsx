
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import MyVoice from './pages/MyVoice'
import History from './pages/History'
import Settings from './pages/Settings'
import Auth from './pages/Auth'
import ResetPassword from './pages/ResetPassword'

import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { WritingProvider } from './context/WritingContext'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public authentication pages */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected application pages */}
          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <WritingProvider>
                  <MainLayout />
                </WritingProvider>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/my-voice" element={<MyVoice />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
