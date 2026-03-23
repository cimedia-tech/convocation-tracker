import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import {
  useConvocation, updateConvocation, deleteConvocation,
  useDays, addDay, updateDay, deleteDay,
  useSessions, addSession, updateSession, deleteSession,
  SESSION_STATUS_LABELS,
} from '../hooks/useConvocationData'
import ConvocationForm from './ConvocationForm'
import DayForm from './DayForm'
import SessionForm from './SessionForm'

const STATUS_DOT = {
  draft: 'bg-church-textMuted',
  confirmed: 'bg-blue-400',
  live: 'bg-green-400 animate-pulse',
  completed: 'bg-church-gold',
  cancelled: 'bg-red-500',
}

function fmtDate(iso) {
  if (!iso) return ''
  const [y, mo, d] = iso.split('-').map(Number)
  return new Date(y, mo - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function fmt12(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${((h % 12) || 12)}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

// Loads sessions for a specific day inline
function DaySessionList({ day, convocationId, isAdmin, userProfile }) {
  const { sessions, loading } = useSessions(day.id)
  const [sessionFormOpen, setSessionFormOpen] = useState(false)

  if (loading) return <p className="text-[10px] text-church-textMuted animate-pulse px-5 py-3">Loading sessions...</p>

  return (
    <div className="border-t border-church-border">
      {sessions.length === 0 ? (
        <p className="text-[10px] text-church-textMuted uppercase tracking-widest px-5 py-4">No sessions scheduled.</p>
      ) : (
        <div className="divide-y divide-church-border">
          {sessions.map(s => (
            <Link
              key={s.id}
              to={`/sessions/${s.id}`}
              className="flex items-center gap-4 px-5 py-3 hover:bg-church-background transition-colors group"
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[s.status] || STATUS_DOT.draft}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-church-textMain font-bold group-hover:text-church-gold transition-colors truncate">{s.title}</p>
                {(s.startTime || s.location) && (
                  <p className="text-[10px] text-church-textMuted uppercase tracking-wider">
                    {fmt12(s.startTime)}{s.location ? ` · ${s.location}` : ''}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {s.roles?.length > 0 && (
                  <span className="text-[9px] font-mono text-church-textMuted">{s.roles.length} roles</span>
                )}
                {s.items?.length > 0 && (
                  <span className="text-[9px] font-mono text-church-textMuted">{s.items.length} items</span>
                )}
                <span className="text-[10px] text-church-gold">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isAdmin && (
        <div className="px-5 py-3 border-t border-church-border">
          <button
            onClick={e => { e.stopPropagation(); setSessionFormOpen(true) }}
            className="text-[10px] uppercase tracking-widest text-church-textMuted hover:text-church-gold transition-colors"
          >
            + Add Session
          </button>
        </div>
      )}

      <SessionForm
        open={sessionFormOpen}
        onClose={() => setSessionFormOpen(false)}
        dayId={day.id}
        convocationId={convocationId}
        date={day.date}
        onSave={async data => { await addSession(data, userProfile?.uid) }}
      />
    </div>
  )
}

function DayCard({ day, convocationId, isAdmin, userProfile, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-church-border bg-church-surface hover:border-church-gold/40 transition-colors">
      <div
        className="flex items-start gap-4 p-5 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Date block */}
        <div className="flex flex-col items-center bg-church-background border border-church-border px-3 py-2 flex-shrink-0 min-w-[64px]">
          <span className="text-[9px] uppercase tracking-widest text-church-textMuted">
            {day.date ? new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' }) : '—'}
          </span>
          <span className="text-2xl font-serif italic text-church-gold leading-none">
            {day.date ? String(new Date(day.date + 'T12:00:00').getDate()).padStart(2, '0') : '—'}
          </span>
          <span className="text-[9px] uppercase tracking-widest text-church-textMuted">
            {day.date ? new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }) : '—'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-church-textMain">{day.label || fmtDate(day.date)}</p>
          {day.highlight && <p className="text-xs text-church-textMuted mt-0.5">{day.highlight}</p>}
          {day.theme && <p className="text-[10px] uppercase tracking-widest text-church-gold/70 mt-1">{day.theme}</p>}
          {day.tags?.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-2">
              {day.tags.map(tag => (
                <span key={tag} className="text-[9px] font-mono uppercase tracking-wider border border-church-border text-church-textMuted px-1.5 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {isAdmin && (
            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
              <button onClick={() => onEdit(day)} className="text-[10px] text-church-textMuted hover:text-white uppercase tracking-widest transition-colors">
                Edit
              </button>
              <button
                onClick={() => { if (window.confirm(`Delete "${day.label || day.date}"?`)) onDelete(day.id) }}
                className="text-[10px] text-red-500/50 hover:text-red-400 uppercase tracking-widest transition-colors"
              >
                Del
              </button>
            </div>
          )}
          <span className={`text-church-textMuted transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>▶</span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <DaySessionList day={day} convocationId={convocationId} isAdmin={isAdmin} userProfile={userProfile} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ConvocationDetail() {
  const { convocationId } = useParams()
  const navigate = useNavigate()
  const { userProfile } = useAuth()
  const { convocation, loading: cLoading } = useConvocation(convocationId)
  const { days, loading: dLoading } = useDays(convocationId)
  const isAdmin = userProfile?.role === 'admin'

  const [editConvOpen, setEditConvOpen] = useState(false)
  const [dayFormOpen, setDayFormOpen] = useState(false)
  const [editingDay, setEditingDay] = useState(null)

  function fmtRange(start, end) {
    if (!start && !end) return null
    if (!end) return fmtDate(start)
    return `${fmtDate(start)} — ${fmtDate(end)}`
  }

  async function handleUpdateConv(data) {
    await updateConvocation(convocationId, data, userProfile?.uid)
  }

  async function handleDeleteConv() {
    if (!window.confirm(`Delete convocation "${convocation.name}"? This will not delete associated days or sessions.`)) return
    await deleteConvocation(convocationId)
    navigate('/events')
  }

  async function handleAddDay(data) {
    await addDay(data, userProfile?.uid)
  }

  async function handleEditDay(data) {
    await updateDay(editingDay.id, data, userProfile?.uid)
  }

  function openEditDay(day) { setEditingDay(day); setDayFormOpen(true) }
  function closeDayForm() { setDayFormOpen(false); setEditingDay(null) }

  if (cLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] font-technical text-church-gold tracking-widest uppercase text-xs animate-pulse">
        Loading...
      </div>
    )
  }

  if (!convocation) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-20 text-center font-technical">
        <p className="text-church-textMuted text-sm uppercase tracking-widest">Convocation not found.</p>
        <Link to="/events" className="text-church-gold text-xs uppercase tracking-widest hover:underline mt-4 block">← Back to Events</Link>
      </div>
    )
  }

  const dateRange = fmtRange(convocation.startDate, convocation.endDate)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto px-4 sm:px-8 py-12 font-technical space-y-8"
    >
      {/* Breadcrumb */}
      <div className="text-[10px] uppercase tracking-widest text-church-textMuted">
        <Link to="/events" className="hover:text-church-gold transition-colors">Events</Link>
        <span className="mx-2">/</span>
        <span className="text-church-textMain">{convocation.name}</span>
      </div>

      {/* Header */}
      <div className="pb-8 border-b border-church-border">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            {convocation.theme && (
              <p className="text-[10px] uppercase tracking-widest text-church-textMuted">{convocation.theme}</p>
            )}
            <h1 className="text-4xl md:text-5xl font-serif italic text-church-textMain leading-tight">
              {convocation.name}<span className="text-church-gold not-italic">.</span>
            </h1>
            <div className="flex flex-wrap gap-4 text-[10px] uppercase tracking-widest text-church-textMuted">
              <span>{convocation.year}</span>
              {dateRange && <span>{dateRange}</span>}
              {convocation.cityState && <span>{convocation.cityState}</span>}
              {convocation.location && <span>{convocation.location}</span>}
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => setEditConvOpen(true)}
                className="text-[10px] uppercase tracking-widest border border-church-border text-church-textMuted px-4 py-2 hover:border-white hover:text-white transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDeleteConv}
                className="text-[10px] uppercase tracking-widest border border-red-900 text-red-500/60 px-4 py-2 hover:border-red-500 hover:text-red-400 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Days */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-church-border pb-3">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-church-gold">
            Schedule — {days.length} {days.length === 1 ? 'Day' : 'Days'}
          </h2>
          {isAdmin && (
            <button
              onClick={() => { setEditingDay(null); setDayFormOpen(true) }}
              className="text-xs uppercase tracking-widest font-bold bg-church-gold text-church-background px-4 py-2 hover:bg-church-darkgold transition-colors"
            >
              + Add Day
            </button>
          )}
        </div>

        {dLoading ? (
          <p className="text-church-textMuted text-xs uppercase tracking-widest animate-pulse">Loading days...</p>
        ) : days.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-church-border">
            <p className="text-church-textMuted text-xs uppercase tracking-widest">No days scheduled yet.</p>
            {isAdmin && (
              <button
                onClick={() => setDayFormOpen(true)}
                className="mt-4 text-church-gold text-xs uppercase tracking-widest hover:underline"
              >
                Add the first day →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {days.map(day => (
              <DayCard
                key={day.id}
                day={day}
                convocationId={convocationId}
                isAdmin={isAdmin}
                userProfile={userProfile}
                onEdit={openEditDay}
                onDelete={id => deleteDay(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ConvocationForm
        open={editConvOpen}
        onClose={() => setEditConvOpen(false)}
        convocation={convocation}
        onSave={handleUpdateConv}
      />

      <DayForm
        open={dayFormOpen}
        onClose={closeDayForm}
        day={editingDay}
        convocationId={convocationId}
        onSave={editingDay ? handleEditDay : handleAddDay}
      />
    </motion.div>
  )
}
