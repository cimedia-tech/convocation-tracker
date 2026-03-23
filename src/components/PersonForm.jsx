import { useState } from 'react'
import Modal, { Field, inputCls, selectCls, FormActions } from './Modal'
import { ROLE_LABELS, ROLE_CATEGORIES } from '../hooks/useConvocationData'

const EMPTY = {
  name: '', title: '', suffix: '', organization: '', location: '', bio: '',
  photoUrl: '', primaryRoles: [], tags: '',
  contact: { phone: '', email: '' },
}

function toForm(person) {
  if (!person) return EMPTY
  return {
    ...EMPTY,
    ...person,
    tags: (person.tags || []).join(', '),
    contact: { phone: person.contact?.phone || '', email: person.contact?.email || '' },
  }
}

export default function PersonForm({ open, onClose, person, onSave }) {
  const [form, setForm] = useState(() => toForm(person))
  const [saving, setSaving] = useState(false)

  // Reset when person prop changes
  useState(() => { setForm(toForm(person)) }, [person])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }
  function setContact(key, val) { setForm(f => ({ ...f, contact: { ...f.contact, [key]: val } })) }

  function toggleRole(role) {
    setForm(f => ({
      ...f,
      primaryRoles: f.primaryRoles.includes(role)
        ? f.primaryRoles.filter(r => r !== role)
        : [...f.primaryRoles, role],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        title: form.title.trim() || null,
        suffix: form.suffix.trim() || null,
        organization: form.organization.trim() || null,
        location: form.location.trim() || null,
        bio: form.bio.trim() || null,
        photoUrl: form.photoUrl.trim() || null,
        primaryRoles: form.primaryRoles,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        contact: {
          phone: form.contact.phone.trim() || null,
          email: form.contact.email.trim() || null,
        },
      }
      await onSave(payload)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={person ? 'Edit Person' : 'Add Person'} width="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" required>
            <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" required />
          </Field>
          <Field label="Title">
            <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Bishop, Dr., Rev." />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Suffix">
            <input className={inputCls} value={form.suffix} onChange={e => set('suffix', e.target.value)} placeholder="Jr., Sr., III" />
          </Field>
          <Field label="Organization">
            <input className={inputCls} value={form.organization} onChange={e => set('organization', e.target.value)} placeholder="Church, ministry, etc." />
          </Field>
        </div>

        <Field label="Location">
          <input className={inputCls} value={form.location} onChange={e => set('location', e.target.value)} placeholder="City, State" />
        </Field>

        <Field label="Bio">
          <textarea className={`${inputCls} h-20 resize-none`} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Brief biography..." />
        </Field>

        <Field label="Photo URL">
          <input className={inputCls} value={form.photoUrl} onChange={e => set('photoUrl', e.target.value)} placeholder="https://..." />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Phone">
            <input className={inputCls} value={form.contact.phone} onChange={e => setContact('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
          </Field>
          <Field label="Email">
            <input className={inputCls} type="email" value={form.contact.email} onChange={e => setContact('email', e.target.value)} placeholder="email@example.com" />
          </Field>
        </div>

        <Field label="Tags">
          <input className={inputCls} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="Comma-separated tags" />
        </Field>

        {/* Role multi-select */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-church-textMuted mb-2">Primary Roles</p>
          <div className="space-y-3 border border-church-border p-4">
            {Object.entries(ROLE_CATEGORIES).map(([cat, roles]) => (
              <div key={cat}>
                <p className="text-[9px] uppercase tracking-widest text-church-textMuted mb-1.5">{cat}</p>
                <div className="flex flex-wrap gap-1.5">
                  {roles.map(role => {
                    const active = form.primaryRoles.includes(role)
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role)}
                        className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border transition-colors ${
                          active
                            ? 'bg-church-gold text-church-background border-church-gold'
                            : 'border-church-border text-church-textMuted hover:border-church-textMuted'
                        }`}
                      >
                        {ROLE_LABELS[role]}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <FormActions onCancel={onClose} submitLabel={person ? 'Update' : 'Add Person'} loading={saving} />
      </form>
    </Modal>
  )
}
