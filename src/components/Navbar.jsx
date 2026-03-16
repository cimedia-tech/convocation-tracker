import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { userProfile, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const isAdmin = userProfile?.role === 'admin'

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/sections', label: 'Sections' },
    ...(isAdmin ? [{ to: '/team', label: 'Team' }] : []),
  ]

  return (
    <nav className="bg-church-navy shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-church-gold font-bold text-lg tracking-wide">✝ Convocation</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-church-gold text-church-navy'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User menu (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {userProfile?.photo && (
              <img src={userProfile.photo} alt="" className="w-8 h-8 rounded-full border-2 border-church-gold" />
            )}
            <span className="text-gray-300 text-sm">{userProfile?.name?.split(' ')[0]}</span>
            {isAdmin && (
              <span className="text-xs bg-church-gold/20 text-church-gold border border-church-gold/40 px-2 py-0.5 rounded-full">Admin</span>
            )}
            <button
              onClick={logout}
              className="text-xs text-gray-400 hover:text-white border border-gray-600 hover:border-gray-400 px-3 py-1 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-300 hover:text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-church-darknavy border-t border-white/10 px-4 py-3 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? 'bg-church-gold text-church-navy'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-2">
            <div className="flex items-center gap-2">
              {userProfile?.photo && (
                <img src={userProfile.photo} alt="" className="w-7 h-7 rounded-full border border-church-gold" />
              )}
              <span className="text-gray-300 text-sm">{userProfile?.name}</span>
            </div>
            <button onClick={logout} className="text-xs text-gray-400 border border-gray-600 px-3 py-1 rounded-lg">
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
