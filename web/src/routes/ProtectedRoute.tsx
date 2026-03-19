import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { NavBar } from '../components/NavBar'

export function ProtectedRoute() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!session) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />
  }

  return (
    <>
      <NavBar />
      <Outlet />
    </>
  )
}
