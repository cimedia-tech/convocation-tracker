import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCollection, deleteDocument } from '../hooks/useFirestore'
import { STATUS_WEIGHT } from './StatusBadge'
import ProgressBar from './ProgressBar'
import AddSectionModal from './AddSectionModal'
import BulkImport from './BulkImport'
import { useAuth } from '../contexts/AuthContext'
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

export default function SectionList() {
  const { userProfile } = useAuth()
  const { docs: sections, loading: sectLoading } = useCollection('sections')
  const { docs: pages, loading: pagesLoading } = useCollection('pages', 'createdAt')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBulkImport, setShowBulkImport] = useState(false)

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
      className="max-w-7xl mx-auto px-4 sm:px-8 py-12 font-technical"
    >
      {/* Editorial Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-end pb-6 border-b border-church-border mb-12">
        <div>
          <h1 className="text-5xl md:text-6xl font-serif italic text-church-textMain leading-[0.9] tracking-tight">
            Section Index
            <span className="text-church-gold not-italic">.</span>
          </h1>
        </div>
        <div className="flex flex-col md:items-end gap-4 mt-6 md:mt-0">
          <p className="text-[10px] text-church-textMuted uppercase tracking-widest font-bold">
            {sections.length} DIR ACTIVE
          </p>
          {isAdmin && (
            <div className="flex gap-4">
              <button
                onClick={() => setShowBulkImport(true)}
                className="text-xs uppercase tracking-widest text-church-textMuted hover:text-white border border-church-border px-4 py-2 hover:border-white transition-colors"
              >
                Bulk Import
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-xs uppercase tracking-widest bg-church-gold text-church-background font-bold px-4 py-2 hover:bg-white transition-colors"
              >
                + Initialize Directory
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {sections.length === 0 ? (
        <motion.div variants={item} className="text-center py-24 border border-dashed border-church-border">
          <div className="text-5xl mb-6 opacity-50">✦</div>
          <h2 className="text-xl font-serif italic text-church-textMain leading-tight mb-2">No active directories</h2>
          <p className="text-church-textMuted text-xs uppercase tracking-widest mb-8">System requires initialization of the first section.</p>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-church-gold text-church-background px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-white transition-colors"
            >
              Initialize Directory
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-church-border">
          {sections.map((section, index) => {
            const sectionPages = pages.filter(p => p.sectionId === section.id)
            const pct = sectionPages.length
              ? sectionPages.reduce((sum, p) => sum + (STATUS_WEIGHT[p.status] || 0), 0) / sectionPages.length
              : 0
            const approved = sectionPages.filter(p => p.status === 'Approved').length

            return (
              <motion.div 
                key={section.id} 
                variants={item}
                className="bg-church-surface flex flex-col justify-between hover:bg-church-background transition-colors group relative overflow-hidden"
              >
                {/* ID Tag */}
                <div className="absolute top-0 right-0 bg-church-border px-2 py-1 text-[8px] font-mono text-church-textMuted uppercase tracking-widest">
                  DIR-{String(index + 1).padStart(3, '0')}
                </div>

                <div className="p-6 md:p-8 flex-grow flex flex-col">
                  {/* Header Area */}
                  <div className="mb-8 mt-4">
                     <Link
                      to={`/sections/${section.id}`}
                      className="font-serif italic text-3xl text-church-textMain group-hover:text-church-gold transition-colors block leading-[1.1] mb-4"
                    >
                      {section.name}
                    </Link>
                    {section.description && (
                      <p className="text-xs text-church-textMuted leading-relaxed line-clamp-3 pl-4 border-l-2 border-church-border">
                        {section.description}
                      </p>
                    )}
                  </div>

                  {/* Stats & Progress Bottom Area */}
                  <div className="mt-auto space-y-4">
                    <ProgressBar percent={pct} size="sm" />
                    <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-widest">
                      <span className="text-church-textMuted">
                        {String(sectionPages.length).padStart(2, '0')} PG
                      </span>
                      <span className="text-church-gold font-bold">
                        {String(approved).padStart(2, '0')} ACK
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="bg-church-background border-t border-church-border px-6 py-3 flex items-center justify-between">
                  <Link
                    to={`/sections/${section.id}`}
                    className="text-[10px] font-bold text-church-textMuted uppercase tracking-widest group-hover:text-church-gold transition-colors"
                  >
                    Enter Directory →
                  </Link>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteSection(section)}
                      className="text-church-textMuted hover:text-[#ff4444] transition-colors pb-0.5"
                      title="Delete section"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="square" strokeLinejoin="miter" d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                      </svg>
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {showAddModal && <AddSectionModal onClose={() => setShowAddModal(false)} />}
      {showBulkImport && <BulkImport onClose={() => setShowBulkImport(false)} />}
    </motion.div>
  )
}
