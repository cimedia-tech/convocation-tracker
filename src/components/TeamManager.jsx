import { useState } from 'react'
import { collection, query, onSnapshot } from 'firebase/firestore'
import { useEffect } from 'react'
import { db } from '../firebase/config'
import { updateDocument, deleteDocument } from '../hooks/useFirestore'
import { useAuth } from '../contexts/AuthContext'

const ROLE_LABELS = {
  admin:   { label: 'Admin',   color: 'bg-church-gold/20 text-church-navy border-church-gold/40' },
  member:  { label: 'Member',  color: 'bg-blue-50 text-blue-700 border-blue-200' },
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-500 border-gray-300' },
}

export default function TeamManager() {
  const { userProfile } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'users'))
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.name?.localeCompare(b.name)))
      setLoading(false)
    })
    return unsub
  }, [])

  const handleRoleChange = async (user, newRole) => {
    await updateDocument('users', user.id, { role: newRole })
  }

  const handleRemove = async (user) => {
    if (!window.confirm(`Remove ${user.name} from the team? They will lose access.`)) return
    await deleteDocument('users', user.id)
  }

  if (userProfile?.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Admin access required.</p>
      </div>
    )
  }

  const pending = users.filter(u => u.role === 'pending')
  const active  = users.filter(u => u.role !== 'pending')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-church-navy">Team Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          Approve new members, manage roles, and control access.
        </p>
      </div>

      {/* Pending approvals */}
      {pending.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <h2 className="text-base font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            Pending Approvals ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map(user => (
              <div key={user.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-yellow-100">
                {user.photo
                  ? <img src={user.photo} alt="" className="w-10 h-10 rounded-full border-2 border-yellow-200" />
                  : <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">{user.name?.[0]}</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRoleChange(user, 'member')}
                    className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRemove(user)}
                    className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active team members */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-church-navy px-5 py-3">
          <h2 className="text-church-gold font-semibold">Active Team ({active.length})</h2>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-400 animate-pulse">Loading…</div>
        ) : active.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No active team members yet.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {active.map(user => {
              const roleInfo = ROLE_LABELS[user.role] || ROLE_LABELS.member
              const isSelf = user.uid === userProfile?.uid
              return (
                <div key={user.id} className="flex items-center gap-3 px-5 py-3">
                  {user.photo
                    ? <img src={user.photo} alt="" className="w-10 h-10 rounded-full border-2 border-gray-100 flex-shrink-0" />
                    : <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold flex-shrink-0">{user.name?.[0]}</div>
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                      {isSelf && <span className="text-xs text-gray-400">(you)</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  {!isSelf && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <select
                        value={user.role}
                        onChange={e => handleRoleChange(user, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-church-gold"
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                      </select>
                      <button
                        onClick={() => handleRemove(user)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Remove member"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-church-cream border border-church-lightgold rounded-xl p-4 text-sm text-gray-600">
        <strong className="text-church-navy">How access works:</strong> When a team member logs in with Google for the first time, they appear in <em>Pending Approvals</em> above. Approve them to grant access, or deny to block them. You can change roles or remove members at any time.
      </div>
    </div>
  )
}
