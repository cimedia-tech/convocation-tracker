import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCollection } from '../hooks/useFirestore'
import { STATUS_WEIGHT } from './StatusBadge'
import ProgressBar from './ProgressBar'
import PageCard from './PageCard'
import AddPageModal from './AddPageModal'
import { useAuth } from '../contexts/AuthContext'

export default function SectionDetail() {
  const { sectionId } = useParams()
  const { userProfile } = useAuth()
  const { docs: sections, loading: sectLoading } = useCollection('sections')
  const { docs: pages, loading: pagesLoading } = useCollection('pages', 'createdAt')
  const { docs: teamMembers } = useCollection('users', 'createdAt')
  const [showAddPage, setShowAddPage] = useState(false)
  const [filterStatus, setFilterStatus] = useState('All')

  const section = sections.find(s => s.id === sectionId)
  const sectionPages = pages.filter(p => p.sectionId === sectionId)
  const isAdmin = userProfile?.role === 'admin'

  const activeMembers = teamMembers.filter(m => m.role !== 'pending')

  const pct = sectionPages.length
    ? sectionPages.reduce((sum, p) => sum + (STATUS_WEIGHT[p.status] || 0), 0) / sectionPages.length
    : 0

  const filteredPages = filterStatus === 'All'
    ? sectionPages
    : sectionPages.filter(p => (p.status || 'Not Started') === filterStatus)

  const allStatuses = ['All', ...new Set(sectionPages.map(p => p.status || 'Not Started'))]

  if (sectLoading || pagesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-church-navy text-lg animate-pulse">Loading…</div>
      </div>
    )
  }

  if (!section) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Section not found.</p>
        <Link to="/sections" className="text-church-gold hover:underline text-sm mt-2 block">← Back to Sections</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/sections" className="hover:text-church-gold transition-colors">Sections</Link>
        <span>/</span>
        <span className="text-church-navy font-medium">{section.name}</span>
      </div>

      {/* Section header */}
      <div className="bg-church-navy rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-church-gold">{section.name}</h1>
            {section.description && (
              <p className="text-gray-300 text-sm mt-1">{section.description}</p>
            )}
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddPage(true)}
              className="flex-shrink-0 bg-church-gold text-church-navy px-4 py-2 rounded-xl text-sm font-bold hover:bg-church-darkgold transition-colors"
            >
              + Add Page
            </button>
          )}
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1 text-sm">
            <span className="text-gray-300">Section Progress</span>
            <span className="text-church-gold font-bold">{Math.round(pct)}%</span>
          </div>
          <ProgressBar percent={pct} size="md" />
          <p className="text-gray-400 text-xs mt-1">
            {sectionPages.filter(p => p.status === 'Approved').length} of {sectionPages.length} pages approved
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      {sectionPages.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {allStatuses.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                filterStatus === s
                  ? 'bg-church-navy text-church-gold border-church-gold'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-church-navy'
              }`}
            >
              {s} {s === 'All' ? `(${sectionPages.length})` : `(${sectionPages.filter(p => (p.status || 'Not Started') === s).length})`}
            </button>
          ))}
        </div>
      )}

      {/* Pages */}
      {filteredPages.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📄</div>
          <p className="text-gray-500 text-sm">
            {sectionPages.length === 0 ? 'No pages in this section yet.' : 'No pages match this filter.'}
          </p>
          {isAdmin && sectionPages.length === 0 && (
            <button
              onClick={() => setShowAddPage(true)}
              className="mt-4 bg-church-navy text-church-gold border border-church-gold px-5 py-2 rounded-xl text-sm font-semibold"
            >
              + Add First Page
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPages.map(page => (
            <PageCard
              key={page.id}
              page={page}
              sectionId={sectionId}
              teamMembers={activeMembers}
            />
          ))}
        </div>
      )}

      {showAddPage && (
        <AddPageModal sectionId={sectionId} onClose={() => setShowAddPage(false)} />
      )}
    </div>
  )
}
