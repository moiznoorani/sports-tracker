import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function NavBar() {
  const { signOut } = useAuth()

  return (
    <nav style={{ display: 'flex', gap: '1rem', padding: '0.75rem 1rem', borderBottom: '1px solid #ccc', alignItems: 'center' }}>
      <NavLink to="/" end style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })}>
        Dashboard
      </NavLink>
      <NavLink to="/profile" style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })}>
        Profile
      </NavLink>
      <button onClick={() => signOut()} style={{ marginLeft: 'auto' }}>
        Sign Out
      </button>
    </nav>
  )
}
