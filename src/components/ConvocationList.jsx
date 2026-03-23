import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import {
  useConvocations, addConvocation, updateConvocation, deleteConvocation,
} from '../hooks/useConvocationData'
import ConvocationForm from './ConvocationForm'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 18 } } }

function fmtDate(iso) {
  if (!iso) return null
  const [y, mo, d] = iso.split('-').map(Number)
  return new Date(y, mo - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ConvocationCard({ conv, isAdmin, onEdit, onDelete }) {
  const start = fmtDate(conv.startDate)
  const end = fmtDate(conv.endDate)
  const dateRange = start && end ? `${start} — ${end}` : start || end

  return (
    <motion.div variants={item} className="bg-church-surface border border-church-border hover:border-church-gold/50 transition-colors group flex flex-col">
      <Link to={`/events/${conv.id}`} className="flex-1 p-6 block">
        <div className="flex items-start justify-between mb-4">
          <span className="text-5xl font-serif italic text-church-gold/30 leading-none">{conv.year}</span>
          {dateRange && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-church-textMuted border border-church-border px-2 py-0.5">
              {dateRange}
            </span>
          )}
        </div>

        <h2 className="font-serif italic text-2xl text-church-textMain leading-tight group-hover:text-church-gold transition-colors mb-2">
          {conv.name}
        </h2>

        {conv.theme && (
          <p className="text-xs text-church-textMuted italic mb-3">{conv.theme}</p>
        )}

        <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-widest text-church-textMuted">
          {conv.cityState && <span>{conv.cityState}</span>}
          {conv.location && <span>{conv.location}</span>}
        </div>

        {conv.tags?.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-3">
            {conv.tags.map(tag => (
              <span key={tag} className="text-[9px] font-mono uppercase tracking-wider border border-church-border text-church-textMuted px-1.5 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>

      <div className="flex items-center justify-between px-6 py-3 border-t border-church-border">
        <Link
          to={`/events/${conv.id}`}
          className="text-[10px] text-church-gold uppercase tracking-widest hover:underline"
        >
          View Schedule →
        </Link>
        {isAdmin && (
          <div className="flex gap-3">
            <button
              onClick={() => onEdit(conv)}
              className="text-[10px] text-church-textMuted hover:text-white uppercase tracking-widest transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => { if (window.confirm(`Delete "${conv.name} ${conv.year}"?`)) onDelete(conv.id) }}
              className="text-[10px] text-red-500/50 hover:text-red-400 uppercase tracking-widest transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function ConvocationList() {
  const { userProfile } = useAuth()
  const { convocations, loading } = useConvocations()
  const isAdmin = userProfile?.role === 'admin'

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  function handleEdit(conv) { setEditing(conv); setFormOpen(true) }
  function handleAdd() { setEditing(null); setFormOpen(true) }
  function handleClose() { setFormOpen(false); setEditing(null) }

  async function handleSave(data) {
    if (editing) {
      await updateConvocation(editing.id, data, userProfile?.uid)
    } else {
      await addConvocation(data, userProfile?.uid)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] font-technical text-church-gold tracking-widest uppercase text-xs animate-pulse">
        Loading Events...
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-8 font-technical"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-end pb-6 border-b border-church-border">
        <div>
          <h1 className="text-5xl md:text-6xl font-serif italic text-church-textMain leading-[0.9] tracking-tight">
            Events<span className="text-church-gold not-italic">.</span>
          </h1>
          <p className="text-church-textMuted text-xs uppercase tracking-widest mt-2">{convocations.length} convocation{convocations.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleAdd}
            className="mt-6 md:mt-0 text-xs uppercase tracking-widest font-bold bg-church-gold text-church-background px-5 py-2.5 hover:bg-church-darkgold transition-colors"
          >
            + New Convocation
          </button>
        )}
      </motion.div>

      {/* Grid */}
      {convocations.length === 0 ? (
        <motion.div variants={item} className="text-center py-24 border border-dashed border-church-border">
          <p className="text-church-textMuted text-xs uppercase tracking-widest">No convocations yet.</p>
          {isAdmin && (
            <button onClick={handleAdd} className="mt-4 text-church-gold text-xs uppercase tracking-widest hover:underline">
              Create the first one →
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-church-border border border-church-border">
          {convocations.map(conv => (
            <ConvocationCard
              key={conv.id}
              conv={conv}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={id => deleteConvocation(id)}
            />
          ))}
        </motion.div>
      )}

      <ConvocationForm
        open={formOpen}
        onClose={handleClose}
        convocation={editing}
        onSave={handleSave}
      />
    </motion.div>
  )
}
