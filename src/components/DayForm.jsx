import { useState, useEffect } from 'react'
import Modal, { Field, inputCls, FormActions } from './Modal'

const EMPTY = { date: '', label: '', highlight: '', theme: '', tags: '' }

function toForm(day) {
  if (!day) return EMPTY
  return { ...EMPTY, ...day, tags: (day.tags || []).join(', ') }
}

export default function DayForm({ open, onClose, day, convocationId, onSave }) {
  const [form, setForm] = useState(() => toForm(day))
  const [saving, setSaving] = useState(false)

  useEffect(() => { setForm(toForm(day)) }, [day])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.date) return
    setSaving(true)
    try {
      await onSave({
        date: form.date,
        label: form.label.trim() || form.date,
        highlight: form.highlight.trim() || null,
        theme: form.theme.trim() || null,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        convocationId: convocationId || day?.convocationId,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={day ? 'Edit Day' : 'Add Day'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date" required>
            <input className={inputCls} type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
          </Field>
          <Field label="Label">
            <input className={inputCls} value={form.label} onChange={e => set('label', e.target.value)} placeholder="Sunday Morning, Opening Night..." />
          </Field>
        </div>

        <Field label="Highlight">
          <input className={inputCls} value={form.highlight} onChange={e => set('highlight', e.target.value)} placeholder="Key speaker, event, etc." />
        </Field>

        <Field label="Theme">
          <input className={inputCls} value={form.theme} onChange={e => set('theme', e.target.value)} placeholder="Day theme or focus..." />
        </Field>

        <Field label="Tags">
          <input className={inputCls} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="Comma-separated tags" />
        </Field>

        <FormActions onCancel={onClose} submitLabel={day ? 'Update Day' : 'Add Day'} loading={saving} />
      </form>
    </Modal>
  )
}
