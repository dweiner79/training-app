import { Link, NavLink } from 'react-router-dom'
import { useMsal } from '@azure/msal-react'
import { useEffect, useState } from 'react'
import { getMyProfile } from '../../services/trainingApi'
import type { UserProfile } from '../../types'

export default function NavBar() {
  const { instance } = useMsal()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    getMyProfile()
      .then(setProfile)
      .catch(() => {/* profile unavailable */})
  }, [])

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/checklist" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">HLS</span>
            </div>
            <span className="font-semibold text-gray-900 hidden sm:block">New Hire Training</span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            <NavLink to="/checklist" className={navLinkClass}>Checklist</NavLink>
            <NavLink to="/calendar" className={navLinkClass}>Calendar</NavLink>
            <NavLink to="/library" className={navLinkClass}>Library</NavLink>
            {profile?.isAdmin && (
              <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
            )}
          </div>

          {/* User menu */}
          <div className="flex items-center gap-3">
            {profile && (
              <span className="text-sm text-gray-600 hidden sm:block">
                {profile.displayName}
              </span>
            )}
            <button
              onClick={() => instance.logoutRedirect({ postLogoutRedirectUri: '/' })}
              className="btn-secondary text-sm py-1.5"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
