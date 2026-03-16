import { useAuth } from '../contexts/AuthContext'

export default function PendingAccess() {
  const { userProfile, logout } = useAuth()

  return (
    <div className="min-h-screen bg-church-navy flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Access Pending</h2>
        <p className="text-gray-500 text-sm mb-4">
          Hi <strong>{userProfile?.name?.split(' ')[0]}</strong>! Your account is awaiting approval from the administrator. You'll be able to access the dashboard once approved.
        </p>
        <p className="text-xs text-gray-400 mb-6">
          Signed in as {userProfile?.email}
        </p>
        <button
          onClick={logout}
          className="w-full border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl py-2.5 text-sm transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
