import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuthStore } from './store/authStore'
import AppLayout from './components/AppLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PromptListPage from './pages/PromptListPage'
import PromptDetailPage from './pages/PromptDetailPage'
import CreatePromptPage from './pages/CreatePromptPage'
import ProfilePage from './pages/ProfilePage'
import MembershipPage from './pages/MembershipPage'
import MyPromptsPage from './pages/MyPromptsPage'
import TrainingPage from './pages/TrainingPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore()

  if (!initialized) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default function App() {
  const initialize = useAuthStore((state) => state.initialize)
  const initialized = useAuthStore((state) => state.initialized)

  useEffect(() => {
    initialize()
  }, [initialize])

  if (!initialized) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', flexDirection: 'column', gap: 16
      }}>
        <Spin size="large" />
        <span style={{ color: '#666' }}>正在加载...</span>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="prompts" element={<PromptListPage />} />
        <Route path="prompts/create" element={<CreatePromptPage />} />
        <Route path="prompts/:id" element={<PromptDetailPage />} />
        <Route path="my-prompts" element={<MyPromptsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="membership" element={<MembershipPage />} />
        <Route path="training" element={<TrainingPage />} />
      </Route>
    </Routes>
  )
}
