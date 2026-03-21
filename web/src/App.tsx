import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AppShell } from './components/AppShell'
import { SignUpPage } from './pages/auth/SignUpPage'
import { SignInPage } from './pages/auth/SignInPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { UpdatePasswordPage } from './pages/auth/UpdatePasswordPage'
import { ProfilePage } from './pages/profile/ProfilePage'
import { LeaguesPage } from './pages/leagues/LeaguesPage'
import { CreateLeaguePage } from './pages/leagues/CreateLeaguePage'
import { LeagueDetailPage } from './pages/leagues/LeagueDetailPage'
import { JoinLeaguePage } from './pages/leagues/JoinLeaguePage'
import { BrowseLeaguesPage } from './pages/leagues/BrowseLeaguesPage'
import { CreateTournamentPage } from './pages/leagues/CreateTournamentPage'
import { TournamentDetailPage } from './pages/leagues/TournamentDetailPage'

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

          {/* Protected routes wrapped in AppShell */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell><Navigate to="/leagues" replace /></AppShell>} path="/" />
            <Route path="/profile" element={<AppShell><ProfilePage /></AppShell>} />
            <Route path="/leagues" element={<AppShell><LeaguesPage /></AppShell>} />
            <Route path="/leagues/browse" element={<AppShell><BrowseLeaguesPage /></AppShell>} />
            <Route path="/leagues/new" element={<AppShell><CreateLeaguePage /></AppShell>} />
            <Route path="/leagues/join/:token" element={<AppShell><JoinLeaguePage /></AppShell>} />
            <Route path="/leagues/:id" element={<AppShell><LeagueDetailPage /></AppShell>} />
            <Route path="/leagues/:id/tournaments/new" element={<AppShell><CreateTournamentPage /></AppShell>} />
            <Route path="/leagues/:id/tournaments/:tournamentId" element={<AppShell><TournamentDetailPage /></AppShell>} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
