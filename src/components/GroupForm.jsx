import { useState, useEffect } from 'react'
import Modal, { Field, inputCls, selectCls, FormActions } from './Modal'
import { GROUP_TYPE_LABELS } from '../hooks/useConvocationData'

const GROUP_TYPES = Object.keys(GROUP_TYPE_LABELS)

const EMPTY = {
  name: '', type: 'choir', location: '', organization: '', bio: '',
  directorId: '', memberIds: [],
}

function toForm(group) {
  if (!group) return EMPTY
  return { ...EMPTY, ...group, directorId: group.directorId || '', memberIds: group.memberIds || [] }
}

export default function GroupForm({ open, onClose, group, people = [], onSave }) {
  const [form, setForm] = useState(() => toForm(group))
  const [saving, setSaving] = useState(false)

  useEffect(() => { setForm(toForm(group)) }, [group])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function toggleMember(personId) {
    setForm(f => ({
      ...f,
      memberIds: f.memberIds.includes(personId)
        ? f.memberIds.filter(id => id !== personId)
        : [...f.memberIds, personId],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        location: form.location.trim() || null,
        organization: form.organization.trim() || null,
        bio: form.bio.trim() || null,
        directorId: form.directorId || null,
        memberIds: form.memberIds,
      }
      await onSave(payload)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const sortedPeople = [...people].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <Modal open={open} onClose={onClose} title={group ? 'Edit Group' : 'Add Group'} width="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" required>
            <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Group name" required />
          </Field>
          <Field label="Type">
            <select className={selectCls} value={form.type} onChange={e => set('type', e.target.value)}>
              {GROUP_TYPES.map(t => (
                <option key={t} value={t}>{GROUP_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Organization">
            <input className={inputCls} value={form.organization} onChange={e => set('organization', e.target.value)} placeholder="Church or ministry" />
          </Field>
          <Field label="Location">
            <input className={inputCls} value={form.location} onChange={e => set('location', e.target.value)} placeholder="City, State" />
          </Field>
        </div>

        <Field label="Bio">
          <textarea className={`${inputCls} h-20 resize-none`} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Brief description..." />
        </Field>

        <Field label="Director">
          <select className={selectCls} value={form.directorId} onChange={e => set('directorId', e.target.value)}>
            <option value="">— None —</option>
            {sortedPeople.map(p => (
              <option key={p.id} value={p.id}>{p.name}{p.title ? ` (${p.title})` : ''}</option>
            ))}
          </select>
        </Field>

        {/* Members multi-select */}
        {sortedPeople.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-church-textMuted mb-1.5">
              Members ({form.memberIds.length} selected)
            </p>
            <div className="border border-church-border max-h-48 overflow-y-auto">
              {sortedPeople.map(p => {
                const checked = form.memberIds.includes(p.id)
                return (
                  <label
                    key={p.id}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${checked ? 'bg-church-gold/10' : 'hover:bg-church-background'}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMember(p.id)}
                      className="accent-church-gold"
                    />
                    <span className="text-sm text-church-textMain">{p.name}</span>
                    {p.title && <span className="text-[10px] text-church-textMuted uppercase tracking-wider">{p.title}</span>}
                  </label>
                )
              })}
            </div>
          </div>
        )}

        <FormActions onCancel={onClose} submitLabel={group ? 'Update' : 'Add Group'} loading={saving} />
      </form>
    </Modal>
  )
}
