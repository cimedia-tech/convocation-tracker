import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { usePeople, addPerson, updatePerson, deletePerson, ROLE_LABELS, ROLE_CATEGORIES } from '../hooks/useConvocationData'
import RoleBadge from './RoleBadge'
import PersonForm from './PersonForm'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 18 } } }

const ALL_ROLES = Object.keys(ROLE_LABELS)
const CATEGORIES = ['All', ...Object.keys(ROLE_CATEGORIES)]

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function PersonCard({ person, onEdit, onDelete, isAdmin }) {
  return (
    <motion.div variants={item} className="bg-church-surface border border-church-border p-5 flex flex-col gap-3 hover:border-church-gold/40 transition-colors group">
      <div className="flex items-start gap-3">
        {person.photoUrl ? (
          <img src={person.photoUrl} alt={person.name} className="w-12 h-12 object-cover border border-church-border grayscale group-hover:grayscale-0 transition-all flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 bg-church-background border border-church-border flex items-center justify-center flex-shrink-0">
            <span className="text-church-gold font-serif italic text-lg">{initials(person.name)}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-serif italic text-church-textMain text-lg leading-tight">
            {person.title && <span className="text-church-textMuted not-italic text-sm mr-1">{person.title}</span>}
            {person.name}
            {person.suffix && <span className="text-church-textMuted text-sm ml-1">{person.suffix}</span>}
          </p>
          {person.organization && (
            <p className="text-[10px] uppercase tracking-widest text-church-textMuted mt-0.5">{person.organization}</p>
          )}
          {person.location && (
            <p className="text-[10px] text-church-textMuted">{person.location}</p>
          )}
        </div>
      </div>

      {person.primaryRoles?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {person.primaryRoles.slice(0, 4).map(r => <RoleBadge key={r} role={r} size="xs" />)}
          {person.primaryRoles.length > 4 && (
            <span className="text-[9px] text-church-textMuted font-mono uppercase tracking-wider border border-church-border px-1.5 py-0.5">
              +{person.primaryRoles.length - 4}
            </span>
          )}
        </div>
      )}

      {isAdmin && (
        <div className="flex gap-2 pt-1 border-t border-church-border">
          <button onClick={() => onEdit(person)} className="text-[10px] uppercase tracking-widest text-church-textMuted hover:text-white transition-colors">
            Edit
          </button>
          <button
            onClick={() => { if (window.confirm(`Remove ${person.name}?`)) onDelete(person.id) }}
            className="text-[10px] uppercase tracking-widest text-red-500/60 hover:text-red-400 transition-colors ml-auto"
          >
            Remove
          </button>
        </div>
      )}
    </motion.div>
  )
}

export default function PeopleRoster() {
  const { userProfile } = useAuth()
  const { people, loading } = usePeople()
  const isAdmin = userProfile?.role === 'admin'

  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const filtered = useMemo(() => {
    const catRoles = catFilter === 'All' ? ALL_ROLES : ROLE_CATEGORIES[catFilter] || []
    return people.filter(p => {
      const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.organization?.toLowerCase().includes(search.toLowerCase())
      const matchCat = catFilter === 'All' || (p.primaryRoles || []).some(r => catRoles.includes(r))
      return matchSearch && matchCat && p.isActive !== false
    })
  }, [people, search, catFilter])

  function handleEdit(person) { setEditing(person); setFormOpen(true) }
  function handleAdd() { setEditing(null); setFormOpen(true) }
  function handleClose() { setFormOpen(false); setEditing(null) }

  async function handleSave(data) {
    if (editing) {
      await updatePerson(editing.id, data, userProfile?.uid)
    } else {
      await addPerson(data, userProfile?.uid)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] font-technical text-church-gold tracking-widest uppercase text-xs animate-pulse">
        Loading Roster...
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
            People<span className="text-church-gold not-italic">.</span>
          </h1>
          <p className="text-church-textMuted text-xs uppercase tracking-widest mt-2">{people.filter(p => p.isActive !== false).length} in roster</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleAdd}
            className="mt-6 md:mt-0 text-xs uppercase tracking-widest font-bold bg-church-gold text-church-background px-5 py-2.5 hover:bg-church-darkgold transition-colors"
          >
            + Add Person
          </button>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
        <input
          className="flex-1 bg-church-surface border border-church-border text-church-textMain text-sm px-4 py-2 placeholder:text-church-textMuted focus:outline-none focus:border-church-gold"
          placeholder="Search by name or organization..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`text-[10px] uppercase tracking-widest px-3 py-2 border transition-colors ${
                catFilter === cat ? 'bg-church-gold text-church-background border-church-gold' : 'border-church-border text-church-textMuted hover:border-church-textMuted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <motion.div variants={item} className="text-center py-20 border border-dashed border-church-border">
          <p className="text-church-textMuted text-xs uppercase tracking-widest">
            {people.length === 0 ? 'No people in roster yet.' : 'No results for current filter.'}
          </p>
          {isAdmin && people.length === 0 && (
            <button onClick={handleAdd} className="mt-4 text-church-gold text-xs uppercase tracking-widest hover:underline">
              Add the first person →
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[1px] bg-church-border border border-church-border">
          {filtered.map(person => (
            <PersonCard
              key={person.id}
              person={person}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={id => deletePerson(id)}
            />
          ))}
        </motion.div>
      )}

      <PersonForm
        open={formOpen}
        onClose={handleClose}
        person={editing}
        onSave={handleSave}
      />
    </motion.div>
  )
}
