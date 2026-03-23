import { useState, useEffect } from 'react'
import Modal, { Field, inputCls, selectCls, FormActions } from './Modal'
import { SESSION_STATUS_LABELS } from '../hooks/useConvocationData'

const STATUSES = Object.keys(SESSION_STATUS_LABELS)

const EMPTY = {
  title: '', theme: '', date: '', startTime: '', endTime: '',
  location: '', cityState: '', venue: '', capacity: '',
  status: 'draft', livestreamUrl: '', publicDescription: '', internalNotes: '',
}

function toForm(session) {
  if (!session) return EMPTY
  return { ...EMPTY, ...session, capacity: session.capacity?.toString() || '' }
}

export default function SessionForm({ open, onClose, session, dayId, convocationId, date, onSave }) {
  const [form, setForm] = useState(() => toForm(session))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(session ? toForm(session) : { ...EMPTY, date: date || '', dayId: dayId || '' })
  }, [session, date, dayId])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        theme: form.theme.trim() || null,
        date: form.date,
        startTime: form.startTime || null,
        endTime: form.endTime || null,
        location: form.location.trim() || null,
        cityState: form.cityState.trim() || null,
        venue: form.venue.trim() || null,
        capacity: form.capacity ? parseInt(form.capacity) : null,
        status: form.status,
        livestreamUrl: form.livestreamUrl.trim() || null,
        publicDescription: form.publicDescription.trim() || null,
        internalNotes: form.internalNotes.trim() || null,
        dayId: dayId || session?.dayId,
        convocationId: convocationId || session?.convocationId,
      }
      await onSave(payload)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={session ? 'Edit Session' : 'New Session'} width="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">

        <Field label="Title" required>
          <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Sunday Morning Worship" required />
        </Field>

        <Field label="Theme">
          <input className={inputCls} value={form.theme} onChange={e => set('theme', e.target.value)} placeholder="Session theme or scripture..." />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Date">
            <input className={inputCls} type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </Field>
          <Field label="Start Time">
            <input className={inputCls} type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} />
          </Field>
          <Field label="End Time">
            <input className={inputCls} type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Status">
            <select className={selectCls} value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{SESSION_STATUS_LABELS[s]}</option>)}
            </select>
          </Field>
          <Field label="Capacity">
            <input className={inputCls} type="number" value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="Seat count" min="0" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Location">
            <input className={inputCls} value={form.location} onChange={e => set('location', e.target.value)} placeholder="Building / hall name" />
          </Field>
          <Field label="Venue">
            <input className={inputCls} value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="Arena, sanctuary, etc." />
          </Field>
        </div>

        <Field label="City / State">
          <input className={inputCls} value={form.cityState} onChange={e => set('cityState', e.target.value)} placeholder="Charlotte, NC" />
        </Field>

        <Field label="Livestream URL">
          <input className={inputCls} value={form.livestreamUrl} onChange={e => set('livestreamUrl', e.target.value)} placeholder="https://youtube.com/..." />
        </Field>

        <Field label="Public Description">
          <textarea className={`${inputCls} h-20 resize-none`} value={form.publicDescription} onChange={e => set('publicDescription', e.target.value)} placeholder="Shown to attendees..." />
        </Field>

        <Field label="Internal Notes">
          <textarea className={`${inputCls} h-16 resize-none`} value={form.internalNotes} onChange={e => set('internalNotes', e.target.value)} placeholder="Staff-only notes..." />
        </Field>

        <FormActions onCancel={onClose} submitLabel={session ? 'Update Session' : 'Create Session'} loading={saving} />
      </form>
    </Modal>
  )
}
