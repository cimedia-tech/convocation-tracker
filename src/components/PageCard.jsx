import { useState } from 'react'
import { updateDocument, deleteDocument } from '../hooks/useFirestore'
import { STATUS_OPTIONS } from './StatusBadge'
import StatusBadge from './StatusBadge'
import { useAuth } from '../contexts/AuthContext'

// Set to true after upgrading Firebase project to Blaze plan
const STORAGE_ENABLED = false

export default function PageCard({ page, sectionId, teamMembers }) {
  const { userProfile } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [status, setStatus] = useState(page.status || 'Not Started')
  const [assignedTo, setAssignedTo] = useState(page.assignedTo || '')
  const [notes, setNotes] = useState(page.notes || '')
  const [title, setTitle] = useState(page.title)
  const [saving, setSaving] = useState(false)

  const isAdmin = userProfile?.role === 'admin'
  const isAssigned = userProfile?.uid === page.assignedTo

  const handleSave = async () => {
    setSaving(true)
    await updateDocument('pages', page.id, { status, assignedTo, notes, title })
    setSaving(false)
    setEditing(false)
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete page "${page.title}"? This cannot be undone.`)) return
    await deleteDocument('pages', page.id)
  }

  const assignedMember = teamMembers.find(m => m.uid === page.assignedTo)

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Card header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-gray-900 truncate">{page.title}</span>
            <StatusBadge status={page.status || 'Not Started'} />
          </div>
          {assignedMember && (
            <div className="flex items-center gap-1.5 mt-0.5">
              {assignedMember.photo && (
                <img src={assignedMember.photo} alt="" className="w-4 h-4 rounded-full" />
              )}
              <span className="text-xs text-gray-400">{assignedMember.name}</span>
            </div>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4">
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Page Title</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-church-gold"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-church-gold bg-white"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              {isAdmin && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Assign To</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-church-gold bg-white"
                    value={assignedTo}
                    onChange={e => setAssignedTo(e.target.value)}
                  >
                    <option value="">— Unassigned —</option>
                    {teamMembers.map(m => (
                      <option key={m.uid} value={m.uid}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-church-gold resize-none"
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-1.5 text-xs hover:bg-gray-50"
                >Cancel</button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-church-navy text-church-gold border border-church-gold rounded-lg py-1.5 text-xs font-semibold disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Quick status update for assigned member */}
              {(isAssigned || isAdmin) && !editing && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Update Status</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-church-gold bg-white"
                    value={status}
                    onChange={async (e) => {
                      const newStatus = e.target.value
                      setStatus(newStatus)
                      await updateDocument('pages', page.id, { status: newStatus })
                    }}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              )}
              {page.notes && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{page.notes}</p>
                </div>
              )}
              {STORAGE_ENABLED && <AssetManager pageId={page.id} sectionId={sectionId} />}
              <div className="flex gap-2 pt-2">
                {(isAdmin || isAssigned) && (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-xs border border-gray-300 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg"
                  >
                    Edit
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={handleDelete}
                    className="text-xs border border-red-200 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg"
                  >
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
