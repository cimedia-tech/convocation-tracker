import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCollection } from '../hooks/useFirestore'
import { STATUS_WEIGHT } from './StatusBadge'
import ProgressBar from './ProgressBar'
import StatusBadge from './StatusBadge'
import { motion } from 'framer-motion'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 15 } }
}

function StatCard({ label, value, sub, active = false }) {
  return (
    <div className={`border border-church-border p-6 flex flex-col justify-between h-32 transition-colors ${active ? 'bg-church-textMain text-church-background' : 'bg-church-surface text-church-textMain'}`}>
      <span className="text-xs font-bold uppercase tracking-widest opacity-60">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-serif italic tracking-tighter leading-none">{value}</span>
        {sub && <span className="text-xs uppercase tracking-widest opacity-40">{sub}</span>}
      </div>
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
      <div className="flex items-center justify-center min-h-[50vh] font-technical text-church-gold tracking-widest uppercase text-xs animate-pulse">
        Polling Database...
      </div>
    )
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-12 font-technical"
    >
      {/* Editorial Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-end pb-6 border-b border-church-border">
        <div>
          <h1 className="text-5xl md:text-6xl font-serif italic text-church-textMain leading-[0.9] tracking-tight">
            Dashboard
            <span className="text-church-gold not-italic">.</span>
          </h1>
        </div>
        <div className="text-right mt-6 md:mt-0">
          <p className="text-[10px] text-church-textMuted uppercase tracking-widest font-bold">Volume One</p>
          <p className="text-church-textMain font-mono text-sm tracking-widest">{new Date().getFullYear()} PRODUCTION</p>
        </div>
      </motion.div>

      {/* Stat grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-church-border">
        <StatCard label="Total Pages" value={stats.total} />
        <StatCard label="Approved" value={stats.approved} active={true} />
        <StatCard label="In-Flight" value={stats.inProgress} />
        <StatCard label="Pending" value={stats.notStarted} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Sections */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-4 border-b border-church-border pb-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-church-gold h-fit">Section Index</h2>
              <Link to="/sections" className="text-[10px] text-church-textMuted hover:text-white uppercase tracking-widest border border-church-border px-2 py-1">
                View All
              </Link>
            </div>
            
            {sections.length === 0 ? (
              <p className="text-church-textMuted text-xs uppercase tracking-widest py-8 text-center border border-dashed border-church-border">
                No sections initialized. <Link to="/sections" className="text-church-gold hover:underline">Begin Assembly →</Link>
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-church-border border border-church-border">
                {sections.map(section => {
                  const sectionPages = pages.filter(p => p.sectionId === section.id)
                  const pct = sectionPages.length
                    ? sectionPages.reduce((sum, p) => sum + (STATUS_WEIGHT[p.status] || 0), 0) / sectionPages.length
                    : 0
                  return (
                    <div key={section.id} className="bg-church-surface p-5 hover:bg-church-background transition-colors flex flex-col justify-between">
                      <div className="flex items-start justify-between mb-6">
                        <Link
                          to={`/sections/${section.id}`}
                          className="font-serif italic text-xl text-church-textMain hover:text-church-gold transition-colors leading-tight"
                        >
                          {section.name}
                        </Link>
                        <span className="text-[10px] font-mono text-church-textMuted bg-church-background px-2 py-0.5 border border-church-border">
                          {String(sectionPages.length).padStart(2, '0')} PG
                        </span>
                      </div>
                      <ProgressBar percent={pct} size="sm" />
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column: Activity */}
        <div className="space-y-8">
          
          <motion.div variants={item} className="bg-church-surface border border-church-border p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-church-textMuted mb-2">Completion Velocity</h2>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-6xl font-serif italic leading-[0.8] tracking-tighter text-church-gold">{Math.round(stats.overall)}</span>
              <span className="text-xl font-mono text-church-textMain">%</span>
            </div>
            <ProgressBar percent={stats.overall} size="md" />
          </motion.div>

          {recentActivity.length > 0 && (
            <motion.div variants={item}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-church-gold mb-4 border-b border-church-border pb-2">Log / Recent Activity</h2>
              <div className="space-y-1">
                {recentActivity.map(page => {
                  const section = sections.find(s => s.id === page.sectionId)
                  return (
                    <div key={page.id} className="flex flex-col gap-2 p-3 bg-church-surface border border-church-border hover:border-church-gold transition-colors group">
                      <div className="flex items-start justify-between min-w-0 gap-4">
                        <Link
                          to={`/sections/${page.sectionId}`}
                          className="font-bold text-sm text-church-textMain group-hover:text-church-gold truncate block"
                        >
                          {page.title}
                        </Link>
                        <StatusBadge status={page.status || 'Not Started'} />
                      </div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-church-textMuted truncate">
                        DIR: {section?.name || 'ROOT'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>

      </div>
    </motion.div>
  )
}
