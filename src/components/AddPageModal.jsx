import { useState } from 'react'
import { addDocument, useCollection } from '../hooks/useFirestore'

export default function AddPageModal({ sectionId, onClose }) {
  const { docs: teamMembers } = useCollection('users', 'createdAt')
  const { docs: pages } = useCollection('pages', 'createdAt')
  const [title, setTitle] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const activeMembers = teamMembers.filter(m => m.role !== 'pending')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    const sectionPages = pages.filter(p => p.sectionId === sectionId)
    await addDocument('pages', {
      sectionId,
      title: title.trim(),
      status: assignedTo ? 'Assigned' : 'Not Started',
      assignedTo: assignedTo || '',
      notes: notes.trim(),
      order: sectionPages.length,
    })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-church-navy rounded-t-2xl px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Add New Page</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Title *</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-church-gold"
              placeholder="e.g. Bishop John Smith & Family"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-church-gold bg-white"
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
            >
              <option value="">— Unassigned —</option>
              {activeMembers.map(m => (
                <option key={m.id} value={m.uid}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-church-gold resize-none"
              rows={3}
              placeholder="Any notes or details for this page…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="flex-1 bg-church-navy text-church-gold border border-church-gold rounded-lg py-2 text-sm font-semibold hover:bg-church-darknavy transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Add Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
