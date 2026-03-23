import { useState } from 'react'
import Modal, { Field, inputCls, selectCls, FormActions } from './Modal'
import { ROLE_LABELS, ROLE_CATEGORIES } from '../hooks/useConvocationData'

export default function RoleAssignmentModal({ open, onClose, people = [], groups = [], onSave, existingRole }) {
  const [form, setForm] = useState(() => existingRole ? {
    role: existingRole.role,
    subject: existingRole.subject,
    personId: existingRole.personId || '',
    groupId: existingRole.groupId || '',
    notes: existingRole.notes || '',
    confirmed: existingRole.confirmed ?? false,
  } : {
    role: 'emcee',
    subject: 'person',
    personId: '',
    groupId: '',
    notes: '',
    confirmed: false,
  })
  const [saving, setSaving] = useState(false)

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.subject === 'person' && !form.personId) return
    if (form.subject === 'group' && !form.groupId) return
    setSaving(true)
    try {
      const payload = form.subject === 'person'
        ? { role: form.role, subject: 'person', personId: form.personId, notes: form.notes || null, confirmed: form.confirmed }
        : { role: form.role, subject: 'group', groupId: form.groupId, notes: form.notes || null, confirmed: form.confirmed }
      await onSave(payload)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const sortedPeople = [...people].sort((a, b) => a.name.localeCompare(b.name))
  const sortedGroups = [...groups].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <Modal open={open} onClose={onClose} title="Assign Role" width="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Role selector grouped by category */}
        <Field label="Role" required>
          <select className={selectCls} value={form.role} onChange={e => set('role', e.target.value)}>
            {Object.entries(ROLE_CATEGORIES).map(([cat, roles]) => (
              <optgroup key={cat} label={cat}>
                {roles.map(r => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>

        {/* Person / Group toggle */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-church-textMuted mb-1.5">Assign to</p>
          <div className="flex">
            {['person', 'group'].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => set('subject', s)}
                className={`flex-1 py-2 text-xs uppercase tracking-widest border transition-colors ${
                  form.subject === s
                    ? 'bg-church-gold text-church-background border-church-gold'
                    : 'border-church-border text-church-textMuted hover:border-church-textMuted'
                }`}
              >
                {s === 'person' ? 'Individual' : 'Group'}
              </button>
            ))}
          </div>
        </div>

        {form.subject === 'person' ? (
          <Field label="Person" required>
            <select className={selectCls} value={form.personId} onChange={e => set('personId', e.target.value)} required>
              <option value="">— Select a person —</option>
              {sortedPeople.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title ? `${p.title} ` : ''}{p.name}
                  {p.organization ? ` · ${p.organization}` : ''}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <Field label="Group" required>
            <select className={selectCls} value={form.groupId} onChange={e => set('groupId', e.target.value)} required>
              <option value="">— Select a group —</option>
              {sortedGroups.map(g => (
                <option key={g.id} value={g.id}>{g.name}{g.organization ? ` · ${g.organization}` : ''}</option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Notes">
          <input className={inputCls} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional context..." />
        </Field>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.confirmed}
            onChange={e => set('confirmed', e.target.checked)}
            className="accent-church-gold w-4 h-4"
          />
          <span className="text-xs text-church-textMuted uppercase tracking-widest">Confirmed / Committed</span>
        </label>

        <FormActions onCancel={onClose} submitLabel="Assign Role" loading={saving} />
      </form>
    </Modal>
  )
}
