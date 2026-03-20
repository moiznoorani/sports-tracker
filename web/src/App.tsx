import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { SignUpPage } from './pages/auth/SignUpPage'
import { SignInPage } from './pages/auth/SignInPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { UpdatePasswordPage } from './pages/auth/UpdatePasswordPage'
import { ProfilePage } from './pages/profile/ProfilePage'
import { LeaguesPage } from './pages/leagues/LeaguesPage'
import { CreateLeaguePage } from './pages/leagues/CreateLeaguePage'

function Dashboard() {
  return <h1>Dashboard</h1>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth routes — accessible unauthenticated */}
          <Route path="/auth/sign-up" element={<SignUpPage />} />
          <Route path="/auth/sign-in" element={<SignInPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/update-password" element={<UpdatePasswordPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/leagues" element={<LeaguesPage />} />
            <Route path="/leagues/new" element={<CreateLeaguePage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
