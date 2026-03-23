import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import {
  useGroups, addGroup, updateGroup, deleteGroup,
  usePeople, GROUP_TYPE_LABELS,
} from '../hooks/useConvocationData'
import GroupForm from './GroupForm'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 18 } } }

const TYPE_COLORS = {
  choir: 'text-purple-300 border-purple-800/60 bg-purple-900/30',
  band: 'text-blue-300 border-blue-800/60 bg-blue-900/30',
  ensemble: 'text-indigo-300 border-indigo-800/60 bg-indigo-900/30',
  praise: 'text-church-gold border-church-gold/30 bg-amber-900/20',
  orchestra: 'text-pink-300 border-pink-800/60 bg-pink-900/20',
  mission: 'text-green-300 border-green-800/60 bg-green-900/20',
  committee: 'text-church-textMuted border-church-border bg-church-surface',
  ministry: 'text-teal-300 border-teal-800/60 bg-teal-900/20',
  department: 'text-orange-300 border-orange-800/60 bg-orange-900/20',
  other: 'text-church-textMuted border-church-border bg-church-surface',
}

function GroupCard({ group, director, memberCount, onEdit, onDelete, isAdmin }) {
  const typeColor = TYPE_COLORS[group.type] || TYPE_COLORS.other

  return (
    <motion.div variants={item} className="bg-church-surface border border-church-border p-5 flex flex-col gap-3 hover:border-church-gold/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-serif italic text-xl text-church-textMain leading-tight">{group.name}</h3>
        <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 border whitespace-nowrap ${typeColor}`}>
          {GROUP_TYPE_LABELS[group.type] || group.type}
        </span>
      </div>

      {(group.organization || group.location) && (
        <p className="text-[10px] uppercase tracking-widest text-church-textMuted">
          {[group.organization, group.location].filter(Boolean).join(' · ')}
        </p>
      )}

      {group.bio && <p className="text-xs text-church-textMuted line-clamp-2">{group.bio}</p>}

      <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-wider text-church-textMuted">
        {director && <span>Dir: {director.name}</span>}
        <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
      </div>

      {isAdmin && (
        <div className="flex gap-2 pt-1 border-t border-church-border">
          <button onClick={() => onEdit(group)} className="text-[10px] uppercase tracking-widest text-church-textMuted hover:text-white transition-colors">
            Edit
          </button>
          <button
            onClick={() => { if (window.confirm(`Remove "${group.name}"?`)) onDelete(group.id) }}
            className="text-[10px] uppercase tracking-widest text-red-500/60 hover:text-red-400 transition-colors ml-auto"
          >
            Remove
          </button>
        </div>
      )}
    </motion.div>
  )
}

const ALL_TYPES = ['All', ...Object.keys(GROUP_TYPE_LABELS)]

export default function GroupList() {
  const { userProfile } = useAuth()
  const { groups, loading: gLoading } = useGroups()
  const { people, loading: pLoading } = usePeople()
  const isAdmin = userProfile?.role === 'admin'

  const [typeFilter, setTypeFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const personMap = useMemo(() => Object.fromEntries(people.map(p => [p.id, p])), [people])

  const filtered = useMemo(() => groups.filter(g => {
    const matchType = typeFilter === 'All' || g.type === typeFilter
    const matchSearch = !search || g.name?.toLowerCase().includes(search.toLowerCase()) ||
      g.organization?.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch && g.isActive !== false
  }), [groups, typeFilter, search])

  function handleEdit(group) { setEditing(group); setFormOpen(true) }
  function handleAdd() { setEditing(null); setFormOpen(true) }
  function handleClose() { setFormOpen(false); setEditing(null) }

  async function handleSave(data) {
    if (editing) {
      await updateGroup(editing.id, data, userProfile?.uid)
    } else {
      await addGroup(data, userProfile?.uid)
    }
  }

  if (gLoading || pLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] font-technical text-church-gold tracking-widest uppercase text-xs animate-pulse">
        Loading Groups...
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
            Groups<span className="text-church-gold not-italic">.</span>
          </h1>
          <p className="text-church-textMuted text-xs uppercase tracking-widest mt-2">{groups.filter(g => g.isActive !== false).length} groups</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleAdd}
            className="mt-6 md:mt-0 text-xs uppercase tracking-widest font-bold bg-church-gold text-church-background px-5 py-2.5 hover:bg-church-darkgold transition-colors"
          >
            + Add Group
          </button>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
        <input
          className="flex-1 bg-church-surface border border-church-border text-church-textMain text-sm px-4 py-2 placeholder:text-church-textMuted focus:outline-none focus:border-church-gold"
          placeholder="Search groups..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-1 flex-wrap">
          {ALL_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`text-[10px] uppercase tracking-widest px-3 py-2 border transition-colors ${
                typeFilter === t ? 'bg-church-gold text-church-background border-church-gold' : 'border-church-border text-church-textMuted hover:border-church-textMuted'
              }`}
            >
              {t === 'All' ? 'All' : GROUP_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <motion.div variants={item} className="text-center py-20 border border-dashed border-church-border">
          <p className="text-church-textMuted text-xs uppercase tracking-widest">
            {groups.length === 0 ? 'No groups yet.' : 'No results for current filter.'}
          </p>
          {isAdmin && groups.length === 0 && (
            <button onClick={handleAdd} className="mt-4 text-church-gold text-xs uppercase tracking-widest hover:underline">
              Add the first group →
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-church-border border border-church-border">
          {filtered.map(group => (
            <GroupCard
              key={group.id}
              group={group}
              director={group.directorId ? personMap[group.directorId] : null}
              memberCount={group.memberIds?.length || 0}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={id => deleteGroup(id)}
            />
          ))}
        </motion.div>
      )}

      <GroupForm
        open={formOpen}
        onClose={handleClose}
        group={editing}
        people={people}
        onSave={handleSave}
      />
    </motion.div>
  )
}
