import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCollection, deleteDocument } from '../hooks/useFirestore'
import { STATUS_WEIGHT } from './StatusBadge'
import ProgressBar from './ProgressBar'
import AddSectionModal from './AddSectionModal'
import { useAuth } from '../contexts/AuthContext'

export default function SectionList() {
  const { userProfile } = useAuth()
  const { docs: sections, loading: sectLoading } = useCollection('sections')
  const { docs: pages, loading: pagesLoading } = useCollection('pages', 'createdAt')
  const [showAddModal, setShowAddModal] = useState(false)

  const isAdmin = userProfile?.role === 'admin'

  const handleDeleteSection = async (section) => {
    const sectionPages = pages.filter(p => p.sectionId === section.id)
    if (!window.confirm(
      `Delete section "${section.name}"?${sectionPages.length > 0 ? ` This will also delete its ${sectionPages.length} page(s).` : ''} This cannot be undone.`
    )) return
    for (const page of sectionPages) {
      await deleteDocument('pages', page.id)
    }
    await deleteDocument('sections', section.id)
  }

  if (sectLoading || pagesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-church-navy text-lg animate-pulse">Loading sections…</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-church-navy">Book Sections</h1>
          <p className="text-gray-500 text-sm mt-1">{sections.length} section{sections.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-church-navy text-church-gold border border-church-gold px-4 py-2 rounded-xl text-sm font-semibold hover:bg-church-darknavy transition-colors"
          >
            + Add Section
          </button>
        )}
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📖</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No sections yet</h2>
          <p className="text-gray-400 text-sm mb-6">Start building the convocation book by adding the first section.</p>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-church-navy text-church-gold border border-church-gold px-6 py-2.5 rounded-xl text-sm font-semibold"
            >
              + Add First Section
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sections.map(section => {
            const sectionPages = pages.filter(p => p.sectionId === section.id)
            const pct = sectionPages.length
              ? sectionPages.reduce((sum, p) => sum + (STATUS_WEIGHT[p.status] || 0), 0) / sectionPages.length
              : 0
            const approved = sectionPages.filter(p => p.status === 'Approved').length

            return (
              <div key={section.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-church-navy px-4 py-3 flex items-start justify-between gap-2">
                  <Link
                    to={`/sections/${section.id}`}
                    className="text-church-gold font-semibold text-base hover:text-church-lightgold transition-colors leading-snug"
                  >
                    {section.name}
                  </Link>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteSection(section)}
                      className="text-gray-500 hover:text-red-400 flex-shrink-0 p-0.5 transition-colors"
                      title="Delete section"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  {section.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">{section.description}</p>
                  )}
                  <ProgressBar percent={pct} size="sm" />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{sectionPages.length} page{sectionPages.length !== 1 ? 's' : ''}</span>
                    <span className="text-green-600 font-medium">{approved} approved</span>
                  </div>
                  <Link
                    to={`/sections/${section.id}`}
                    className="block text-center text-xs font-semibold text-church-navy border border-church-navy/20 hover:bg-church-navy hover:text-church-gold rounded-lg py-1.5 transition-colors"
                  >
                    View Pages →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showAddModal && <AddSectionModal onClose={() => setShowAddModal(false)} />}
    </div>
  )
}
