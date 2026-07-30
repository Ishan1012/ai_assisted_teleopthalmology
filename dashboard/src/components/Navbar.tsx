import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Eye, LogOut, User as UserIcon, LogIn, UserPlus } from 'lucide-react'

export function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-semibold text-neutral-900 tracking-tight text-lg group">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center transition-transform group-hover:scale-105">
            <Eye className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span>ClearSight</span>
          <span className="text-[10px] font-mono uppercase bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded border border-neutral-200 ml-1">
            Research AI
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              isActive('/') ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`text-sm font-medium transition-colors ${
              isActive('/about') ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            About Research
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className={`text-sm font-medium transition-colors ${
                isActive('/dashboard') ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-neutral-100 border border-neutral-200">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-6 h-6 rounded-full" />
                ) : (
                  <UserIcon className="w-4 h-4 text-neutral-600" />
                )}
                <span className="text-xs font-medium text-neutral-800">{user.name || user.email}</span>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-all shadow-sm hover:shadow"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

