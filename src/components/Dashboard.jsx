import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCollection } from '../hooks/useFirestore'
import { STATUS_WEIGHT } from './StatusBadge'
import ProgressBar from './ProgressBar'
import StatusBadge from './StatusBadge'

function StatCard({ label, value, sub, color = 'text-church-navy' }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col items-center text-center">
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
      <span className="text-sm font-medium text-gray-700 mt-1">{label}</span>
      {sub && <span className="text-xs text-gray-400 mt-0.5">{sub}</span>}
    </div>
  )
}

export default function Dashboard() {
  const { docs: sections, loading: sectLoading } = useCollection('sections')
  const { docs: pages, loading: pagesLoading } = useCollection('pages', 'createdAt')

  const stats = useMemo(() => {
    if (!pages.length) return { overall: 0, approved: 0, inProgress: 0, notStarted: 0, total: 0 }
    const total = pages.length
    const approved = pages.filter(p => p.status === 'Approved').length
    const inProgress = pages.filter(p =>
      ['In Progress', 'Draft', 'Complete', 'Under Review', 'Final'].includes(p.status)
    ).length
    const notStarted = pages.filter(p => p.status === 'Not Started' || !p.status).length
    const overall = pages.reduce((sum, p) => sum + (STATUS_WEIGHT[p.status] || 0), 0) / total
    return { overall, approved, inProgress, notStarted, total }
  }, [pages])

  const recentActivity = useMemo(() => {
    return [...pages]
      .filter(p => p.updatedAt)
      .sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0))
      .slice(0, 6)
  }, [pages])

  if (sectLoading || pagesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-church-navy text-lg animate-pulse">Loading dashboard…</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-church-navy">Production Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overall progress for the Convocation Book</p>
      </div>

      {/* Overall progress */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-church-navy">Overall Book Completion</h2>
          <span className="text-2xl font-bold text-church-gold">{Math.round(stats.overall)}%</span>
        </div>
        <ProgressBar percent={stats.overall} size="lg" />
        <p className="text-xs text-gray-400 mt-2">
          {stats.approved} of {stats.total} pages approved
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Pages" value={stats.total} />
        <StatCard label="Approved" value={stats.approved} color="text-green-600" />
        <StatCard label="In Progress" value={stats.inProgress} color="text-yellow-600" />
        <StatCard label="Not Started" value={stats.notStarted} color="text-gray-400" />
      </div>

      {/* Section breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-church-navy">Section Breakdown</h2>
          <Link to="/sections" className="text-sm text-church-gold hover:underline font-medium">
            View All →
          </Link>
        </div>
        {sections.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">
            No sections yet. <Link to="/sections" className="text-church-gold hover:underline">Add the first section →</Link>
          </p>
        ) : (
          <div className="space-y-4">
            {sections.map(section => {
              const sectionPages = pages.filter(p => p.sectionId === section.id)
              const pct = sectionPages.length
                ? sectionPages.reduce((sum, p) => sum + (STATUS_WEIGHT[p.status] || 0), 0) / sectionPages.length
                : 0
              return (
                <div key={section.id}>
                  <div className="flex items-center justify-between mb-1">
                    <Link
                      to={`/sections/${section.id}`}
                      className="text-sm font-medium text-church-navy hover:text-church-gold transition-colors"
                    >
                      {section.name}
                    </Link>
                    <span className="text-xs text-gray-500">{sectionPages.length} page{sectionPages.length !== 1 ? 's' : ''}</span>
                  </div>
                  <ProgressBar percent={pct} size="sm" />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-church-navy mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map(page => {
              const section = sections.find(s => s.id === page.sectionId)
              return (
                <div key={page.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/sections/${page.sectionId}`}
                      className="font-medium text-gray-800 hover:text-church-gold truncate block"
                    >
                      {page.title}
                    </Link>
                    <span className="text-xs text-gray-400">{section?.name || '—'}</span>
                  </div>
                  <StatusBadge status={page.status || 'Not Started'} />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
