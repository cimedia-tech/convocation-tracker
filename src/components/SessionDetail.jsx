import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import {
  useSession, updateSession, deleteSession,
  usePeople, useGroups,
  SESSION_STATUS_LABELS, ROLE_LABELS, ITEM_TYPE_LABELS,
} from '../hooks/useConvocationData'
import RoleBadge from './RoleBadge'
import RoleAssignmentModal from './RoleAssignmentModal'
import SessionItemForm from './SessionItemForm'
import SessionForm from './SessionForm'

const STATUS_COLORS = {
  draft:     'text-church-textMuted border-church-border',
  confirmed: 'text-blue-300 border-blue-700',
  live:      'text-green-300 border-green-600 animate-pulse',
  completed: 'text-church-gold border-church-gold/40',
  cancelled: 'text-red-400 border-red-800',
}

const ITEM_TYPE_ICON = {
  performance:  '♪', program: '📄', segment: '◈', collection: '⊕',
  break: '—', ceremony: '★', announcement: '◉', media: '▶', other: '·',
}

function fmt12(time24) {
  if (!time24) return null
  const [h, m] = time24.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${((h % 12) || 12)}:${String(m).padStart(2, '0')} ${ampm}`
}

function fmtDate(iso) {
  if (!iso) return ''
  const [y, mo, d] = iso.split('-').map(Number)
  return new Date(y, mo - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

const TABS = ['Runsheet', 'Roles', 'Info']

export default function SessionDetail() {
  const { sessionId } = useParams()
  const { userProfile } = useAuth()
  const { session, loading } = useSession(sessionId)
  const { people } = usePeople()
  const { groups } = useGroups()
  const isAdmin = userProfile?.role === 'admin'

  const [tab, setTab] = useState('Runsheet')
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [itemFormOpen, setItemFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [editSessionOpen, setEditSessionOpen] = useState(false)

  const personMap = useMemo(() => Object.fromEntries(people.map(p => [p.id, p])), [people])
  const groupMap = useMemo(() => Object.fromEntries(groups.map(g => [g.id, g])), [groups])

  const sortedItems = useMemo(() => {
    return [...(session?.items || [])].sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [session?.items])

  const nextOrder = sortedItems.length ? (sortedItems[sortedItems.length - 1].order || 0) + 1 : 1

  async function addRole(rolePayload) {
    const roles = [...(session.roles || []), rolePayload]
    await updateSession(sessionId, { roles }, userProfile?.uid)
  }

  async function removeRole(idx) {
    if (!window.confirm('Remove this role assignment?')) return
    const roles = (session.roles || []).filter((_, i) => i !== idx)
    await updateSession(sessionId, { roles }, userProfile?.uid)
  }

  async function addItem(itemPayload) {
    const items = [...(session.items || []), { id: crypto.randomUUID(), ...itemPayload }]
    await updateSession(sessionId, { items }, userProfile?.uid)
  }

  async function updateItem(itemPayload) {
    const items = (session.items || []).map(it => it.id === editingItem.id ? { ...it, ...itemPayload } : it)
    await updateSession(sessionId, { items }, userProfile?.uid)
  }

  async function removeItem(itemId) {
    if (!window.confirm('Remove this item?')) return
    const items = (session.items || []).filter(it => it.id !== itemId)
    await updateSession(sessionId, { items }, userProfile?.uid)
  }

  async function moveItem(itemId, dir) {
    const sorted = [...sortedItems]
    const idx = sorted.findIndex(it => it.id === itemId)
    const swap = idx + dir
    if (swap < 0 || swap >= sorted.length) return
    const newOrder = sorted[idx].order
    const swapOrder = sorted[swap].order
    const items = (session.items || []).map(it => {
      if (it.id === sorted[idx].id) return { ...it, order: swapOrder }
      if (it.id === sorted[swap].id) return { ...it, order: newOrder }
      return it
    })
    await updateSession(sessionId, { items }, userProfile?.uid)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] font-technical text-church-gold tracking-widest uppercase text-xs animate-pulse">
        Loading Session...
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-20 text-center font-technical">
        <p className="text-church-textMuted text-sm uppercase tracking-widest">Session not found.</p>
        <Link to="/events" className="text-church-gold text-xs uppercase tracking-widest hover:underline mt-4 block">← Back to Events</Link>
      </div>
    )
  }

  const statusColor = STATUS_COLORS[session.status] || STATUS_COLORS.draft

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto px-4 sm:px-8 py-12 font-technical space-y-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-church-textMuted">
        <Link to="/events" className="hover:text-church-gold transition-colors">Events</Link>
        <span>/</span>
        {session.convocationId && (
          <>
            <Link to={`/events/${session.convocationId}`} className="hover:text-church-gold transition-colors">Convocation</Link>
            <span>/</span>
          </>
        )}
        <span className="text-church-textMain">{session.title}</span>
      </div>

      {/* Session header */}
      <div className="border-b border-church-border pb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            {session.theme && (
              <p className="text-[10px] uppercase tracking-widest text-church-textMuted">{session.theme}</p>
            )}
            <h1 className="text-4xl md:text-5xl font-serif italic text-church-textMain leading-tight">
              {session.title}<span className="text-church-gold not-italic">.</span>
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-widest text-church-textMuted">
              {session.date && <span>{fmtDate(session.date)}</span>}
              {(session.startTime || session.endTime) && (
                <span>{fmt12(session.startTime)}{session.endTime ? ` — ${fmt12(session.endTime)}` : ''}</span>
              )}
              {session.location && <span>{session.location}</span>}
              {session.cityState && <span>{session.cityState}</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-mono uppercase tracking-widest px-3 py-1 border ${statusColor}`}>
              {SESSION_STATUS_LABELS[session.status] || session.status}
            </span>
            {isAdmin && (
              <button
                onClick={() => setEditSessionOpen(true)}
                className="text-[10px] uppercase tracking-widest border border-church-border text-church-textMuted px-3 py-1 hover:border-white hover:text-white transition-colors"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-church-border">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-xs uppercase tracking-widest transition-colors relative ${
              tab === t ? 'text-church-gold' : 'text-church-textMuted hover:text-church-textMain'
            }`}
          >
            {t}
            {tab === t && <motion.div layoutId="session-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-church-gold" />}
          </button>
        ))}
      </div>

      {/* ── RUNSHEET TAB ────────────────────────────────────────────── */}
      {tab === 'Runsheet' && (
        <div className="space-y-3">
          {isAdmin && (
            <div className="flex justify-end">
              <button
                onClick={() => { setEditingItem(null); setItemFormOpen(true) }}
                className="text-xs uppercase tracking-widest font-bold bg-church-gold text-church-background px-4 py-2 hover:bg-church-darkgold transition-colors"
              >
                + Add Item
              </button>
            </div>
          )}

          {sortedItems.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-church-border">
              <p className="text-church-textMuted text-xs uppercase tracking-widest">No items on the runsheet yet.</p>
            </div>
          ) : (
            <div className="space-y-[1px] border border-church-border bg-church-border">
              {sortedItems.map((it, idx) => {
                const performers = [
                  ...(it.personIds || []).map(id => personMap[id]?.name).filter(Boolean),
                  ...(it.groupIds || []).map(id => groupMap[id]?.name).filter(Boolean),
                  ...(it.honoreeIds || []).map(id => personMap[id]?.name).filter(Boolean),
                ].join(', ')

                return (
                  <div key={it.id || idx} className="bg-church-surface flex items-start gap-4 p-4 hover:bg-church-background transition-colors group">
                    {/* Order + icon */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0 w-10">
                      <span className="text-church-gold font-mono text-lg">{ITEM_TYPE_ICON[it.type] || '·'}</span>
                      <span className="text-[9px] font-mono text-church-textMuted">{String(it.order || idx + 1).padStart(2, '0')}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-church-textMain font-bold text-sm">{it.label}</p>
                          {it.description && <p className="text-xs text-church-textMuted mt-0.5">{it.description}</p>}
                          {performers && <p className="text-[10px] text-church-textMuted uppercase tracking-wider mt-1">{performers}</p>}
                          {it.songs?.length > 0 && <p className="text-[10px] italic text-church-textMuted mt-0.5">{it.songs.join(' · ')}</p>}
                          {it.purpose && <p className="text-[10px] text-church-textMuted uppercase tracking-wider mt-0.5">{it.purpose}</p>}
                          {it.award && <p className="text-[10px] text-church-gold uppercase tracking-wider mt-0.5">★ {it.award}</p>}
                          {it.notes && <p className="text-[10px] text-church-textMuted mt-1 border-l border-church-border pl-2">{it.notes}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {it.duration && (
                            <span className="text-[10px] font-mono text-church-textMuted">{it.duration}m</span>
                          )}
                          <span className="text-[9px] font-mono uppercase text-church-textMuted border border-church-border px-1.5 py-0.5">
                            {ITEM_TYPE_LABELS[it.type] || it.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Admin controls */}
                    {isAdmin && (
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => moveItem(it.id, -1)} disabled={idx === 0} className="text-[10px] text-church-textMuted hover:text-white disabled:opacity-20 px-1">▲</button>
                        <button onClick={() => moveItem(it.id, 1)} disabled={idx === sortedItems.length - 1} className="text-[10px] text-church-textMuted hover:text-white disabled:opacity-20 px-1">▼</button>
                        <button onClick={() => { setEditingItem(it); setItemFormOpen(true) }} className="text-[10px] text-church-textMuted hover:text-white px-1">✎</button>
                        <button onClick={() => removeItem(it.id)} className="text-[10px] text-red-500/60 hover:text-red-400 px-1">✕</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ROLES TAB ───────────────────────────────────────────────── */}
      {tab === 'Roles' && (
        <div className="space-y-3">
          {isAdmin && (
            <div className="flex justify-end">
              <button
                onClick={() => setRoleModalOpen(true)}
                className="text-xs uppercase tracking-widest font-bold bg-church-gold text-church-background px-4 py-2 hover:bg-church-darkgold transition-colors"
              >
                + Assign Role
              </button>
            </div>
          )}

          {!session.roles?.length ? (
            <div className="text-center py-16 border border-dashed border-church-border">
              <p className="text-church-textMuted text-xs uppercase tracking-widest">No roles assigned yet.</p>
            </div>
          ) : (
            <div className="space-y-[1px] border border-church-border bg-church-border">
              {session.roles.map((r, idx) => {
                const person = r.subject === 'person' ? personMap[r.personId] : null
                const group = r.subject === 'group' ? groupMap[r.groupId] : null
                const name = person
                  ? `${person.title ? person.title + ' ' : ''}${person.name}`
                  : group?.name || '—'

                return (
                  <div key={idx} className="bg-church-surface flex items-center gap-4 px-5 py-3 hover:bg-church-background transition-colors group">
                    <RoleBadge role={r.role} />
                    <div className="flex-1 min-w-0">
                      <p className="text-church-textMain text-sm font-bold truncate">{name}</p>
                      {person?.organization && (
                        <p className="text-[10px] text-church-textMuted uppercase tracking-wider">{person.organization}</p>
                      )}
                      {group?.type && (
                        <p className="text-[10px] text-church-textMuted uppercase tracking-wider">{group.type}</p>
                      )}
                      {r.notes && <p className="text-[10px] text-church-textMuted mt-0.5">{r.notes}</p>}
                    </div>
                    {r.confirmed && (
                      <span className="text-[9px] text-green-400 font-mono uppercase tracking-wider border border-green-800 px-2 py-0.5">✓ Confirmed</span>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => removeRole(idx)}
                        className="text-[10px] text-red-500/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── INFO TAB ────────────────────────────────────────────────── */}
      {tab === 'Info' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              ['Status', SESSION_STATUS_LABELS[session.status] || session.status],
              ['Date', fmtDate(session.date)],
              ['Start', fmt12(session.startTime)],
              ['End', fmt12(session.endTime)],
              ['Location', session.location],
              ['Venue', session.venue],
              ['City / State', session.cityState],
              ['Capacity', session.capacity],
            ].filter(([, v]) => v).map(([label, val]) => (
              <div key={label} className="border-l-2 border-church-border pl-4">
                <p className="text-[10px] uppercase tracking-widest text-church-textMuted">{label}</p>
                <p className="text-sm text-church-textMain mt-0.5">{val}</p>
              </div>
            ))}
          </div>

          {session.publicDescription && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-church-textMuted mb-1">Public Description</p>
              <p className="text-sm text-church-textMain">{session.publicDescription}</p>
            </div>
          )}

          {session.internalNotes && (
            <div className="bg-church-surface border border-church-border p-4">
              <p className="text-[10px] uppercase tracking-widest text-church-gold mb-1">Internal Notes</p>
              <p className="text-sm text-church-textMain">{session.internalNotes}</p>
            </div>
          )}

          {session.livestreamUrl && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-church-textMuted mb-1">Livestream</p>
              <a href={session.livestreamUrl} target="_blank" rel="noreferrer" className="text-church-gold text-sm hover:underline break-all">
                {session.livestreamUrl}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <RoleAssignmentModal
        open={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        people={people}
        groups={groups}
        onSave={addRole}
      />

      <SessionItemForm
        open={itemFormOpen}
        onClose={() => { setItemFormOpen(false); setEditingItem(null) }}
        item={editingItem}
        nextOrder={nextOrder}
        people={people}
        groups={groups}
        onSave={editingItem ? updateItem : addItem}
      />

      <SessionForm
        open={editSessionOpen}
        onClose={() => setEditSessionOpen(false)}
        session={session}
        onSave={async data => { await updateSession(sessionId, data, userProfile?.uid) }}
      />
    </motion.div>
  )
}
