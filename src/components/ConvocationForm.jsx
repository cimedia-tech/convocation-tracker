import { useState, useEffect } from 'react'
import Modal, { Field, inputCls, FormActions } from './Modal'

const EMPTY = {
  name: '', year: new Date().getFullYear().toString(), theme: '',
  startDate: '', endDate: '', location: '', cityState: '', websiteUrl: '',
}

function toForm(conv) {
  if (!conv) return EMPTY
  return { ...EMPTY, ...conv, year: conv.year?.toString() || EMPTY.year }
}

export default function ConvocationForm({ open, onClose, convocation, onSave }) {
  const [form, setForm] = useState(() => toForm(convocation))
  const [saving, setSaving] = useState(false)

  useEffect(() => { setForm(toForm(convocation)) }, [convocation])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await onSave({
        name: form.name.trim(),
        year: parseInt(form.year) || new Date().getFullYear(),
        theme: form.theme.trim() || null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        location: form.location.trim() || null,
        cityState: form.cityState.trim() || null,
        websiteUrl: form.websiteUrl.trim() || null,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={convocation ? 'Edit Convocation' : 'New Convocation'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Field label="Name" required>
              <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Annual Holy Convocation" required />
            </Field>
          </div>
          <Field label="Year">
            <input className={inputCls} type="number" value={form.year} onChange={e => set('year', e.target.value)} min="2000" max="2100" />
          </Field>
        </div>

        <Field label="Theme">
          <input className={inputCls} value={form.theme} onChange={e => set('theme', e.target.value)} placeholder="Event theme or scripture..." />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Date">
            <input className={inputCls} type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
          </Field>
          <Field label="End Date">
            <input className={inputCls} type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Location">
            <input className={inputCls} value={form.location} onChange={e => set('location', e.target.value)} placeholder="Venue name" />
          </Field>
          <Field label="City / State">
            <input className={inputCls} value={form.cityState} onChange={e => set('cityState', e.target.value)} placeholder="Charlotte, NC" />
          </Field>
        </div>

        <Field label="Website URL">
          <input className={inputCls} value={form.websiteUrl} onChange={e => set('websiteUrl', e.target.value)} placeholder="https://..." />
        </Field>

        <FormActions onCancel={onClose} submitLabel={convocation ? 'Update' : 'Create'} loading={saving} />
      </form>
    </Modal>
  )
}
