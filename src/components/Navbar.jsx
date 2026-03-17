import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const { userProfile, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const isAdmin = userProfile?.role === 'admin'

  const navLinks = [
    { to: '/', label: 'Overview' },
    { to: '/sections', label: 'Index' },
    ...(isAdmin ? [{ to: '/team', label: 'Operatives' }] : []),
  ]

  return (
    <nav className="bg-church-background border-b border-church-border sticky top-0 z-50 font-technical">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-8 h-8 bg-church-gold flex items-center justify-center transition-transform group-hover:scale-95">
              <span className="text-church-background font-bold text-sm">✝</span>
            </div>
            <span className="text-church-textMain font-serif italic text-xl tracking-wide hidden sm:inline-block group-hover:text-church-gold transition-colors">
              Convocation<span className="text-church-textMuted not-italic text-sm ml-1">Tracker.</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 text-sm tracking-widest uppercase">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`py-5 transition-colors relative ${
                    location.pathname === link.to
                      ? 'text-church-gold font-bold'
                      : 'text-church-textMuted hover:text-church-textMain'
                  }`}
                >
                  {link.label}
                  {location.pathname === link.to && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-church-gold"
                    />
                  )}
                </Link>
              ))}
            </div>

            <div className="h-6 w-[1px] bg-church-border mx-2"></div>

            {/* User menu (desktop) */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {userProfile?.photo && (
                  <img src={userProfile.photo} alt="" className="w-8 h-8 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all border border-church-border" />
                )}
                <div className="flex flex-col">
                  <span className="text-church-textMain text-xs font-bold uppercase tracking-wider">{userProfile?.name?.split(' ')[0]}</span>
                  {isAdmin && (
                    <span className="text-[10px] text-church-gold uppercase tracking-widest">Admin</span>
                  )}
                </div>
              </div>
              <button
                onClick={logout}
                className="text-xs uppercase tracking-widest text-church-textMuted hover:text-church-textMain border border-church-border hover:border-white px-4 py-2 transition-colors duration-300"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-church-textMuted hover:text-church-textMain p-2 border border-transparent hover:border-church-border transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-church-surface border-b border-church-border overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={`text-sm uppercase tracking-widest ${
                      location.pathname === link.to
                        ? 'text-church-gold font-bold'
                        : 'text-church-textMuted hover:text-church-textMain'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="h-[1px] w-full bg-church-border"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {userProfile?.photo && (
                    <img src={userProfile.photo} alt="" className="w-8 h-8 grayscale border border-church-border" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-church-textMain text-xs font-bold uppercase">{userProfile?.name}</span>
                    <span className="text-[10px] text-church-gold uppercase tracking-widest">{isAdmin ? 'Admin' : 'Operative'}</span>
                  </div>
                </div>
                <button onClick={logout} className="text-xs text-church-textMuted border border-church-border px-4 py-2 uppercase hover:text-white transition-colors">
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
