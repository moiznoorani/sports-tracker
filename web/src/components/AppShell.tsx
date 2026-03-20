import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { ReactNode } from 'react'

const navItems = [
  { to: '/leagues', label: 'Leagues', icon: '⬡' },
  { to: '/profile', label: 'Profile', icon: '◎' },
]

export function AppShell({ children }: { children: ReactNode }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth/sign-in', { replace: true })
  }

  return (
    <div className="flex h-full min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col w-60 shrink-0 py-8 px-4"
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderRight: '0.5px solid var(--border-subtle)',
        }}
      >
        {/* Logo */}
        <div className="px-3 mb-10">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7B3F85, #9B5AA6)' }}
            >
              <span className="text-white text-xs font-bold">ST</span>
            </div>
            <span className="font-bold text-sm tracking-wide" style={{ color: 'var(--text-primary)' }}>
              Sports Tracker
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive ? 'text-white' : 'hover:bg-white/5'
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--text-primary)' : 'var(--text-subtle)',
                background: isActive ? 'rgba(123,63,133,0.18)' : undefined,
              })}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 hover:bg-white/5 w-full text-left"
          style={{ color: 'var(--text-subtle)' }}
        >
          <span className="text-base">⎋</span>
          Sign Out
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Mobile top bar */}
        <div
          className="md:hidden flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '0.5px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7B3F85, #9B5AA6)' }}
            >
              <span className="text-white text-xs font-bold">ST</span>
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Sports Tracker</span>
          </div>
          <div className="flex items-center gap-2">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all ${
                    isActive ? '' : 'opacity-50'
                  }`
                }
                style={({ isActive }) => ({
                  background: isActive ? 'rgba(123,63,133,0.18)' : 'transparent',
                  color: 'var(--text-primary)',
                })}
              >
                {item.icon}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex-1 p-5 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
