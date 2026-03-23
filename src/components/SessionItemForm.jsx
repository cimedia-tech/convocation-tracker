import { useState, useEffect } from 'react'
import Modal, { Field, inputCls, selectCls, FormActions } from './Modal'
import { ITEM_TYPE_LABELS } from '../hooks/useConvocationData'

const ITEM_TYPES = Object.keys(ITEM_TYPE_LABELS)
const COLLECTION_METHODS = ['plate', 'envelope', 'digital', 'buckets']

const EMPTY = {
  type: 'performance', label: '', description: '', duration: '',
  notes: '', order: '',
  // performance / segment
  songs: '',
  personIds: [],
  groupIds: [],
  // collection
  method: 'plate', purpose: '',
  // ceremony
  award: '',
  honoreeIds: [],
  // program
  pageCount: '', fileUrl: '',
  // media
  mediaUrl: '',
  // segment
  location: '', capacity: '',
}

function toForm(item, nextOrder) {
  if (!item) return { ...EMPTY, order: nextOrder || 1 }
  return {
    ...EMPTY,
    ...item,
    songs: (item.songs || []).join(', '),
    duration: item.duration?.toString() || '',
    order: item.order?.toString() || '',
    pageCount: item.pageCount?.toString() || '',
    capacity: item.capacity?.toString() || '',
  }
}

export default function SessionItemForm({ open, onClose, item, nextOrder, people = [], groups = [], onSave }) {
  const [form, setForm] = useState(() => toForm(item, nextOrder))
  const [saving, setSaving] = useState(false)

  useEffect(() => { setForm(toForm(item, nextOrder)) }, [item, nextOrder])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function toggleId(key, id) {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(id) ? f[key].filter(x => x !== id) : [...f[key], id],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.label.trim()) return
    setSaving(true)
    try {
      const base = {
        type: form.type,
        label: form.label.trim(),
        description: form.description.trim() || null,
        notes: form.notes.trim() || null,
        order: parseInt(form.order) || nextOrder || 1,
        duration: form.duration ? parseInt(form.duration) : null,
      }
      let extra = {}
      const t = form.type
      if (t === 'performance' || t === 'segment') {
        extra = {
          groupIds: form.groupIds,
          personIds: form.personIds,
          songs: form.songs.split(',').map(s => s.trim()).filter(Boolean),
        }
        if (t === 'segment') {
          extra.location = form.location.trim() || null
          extra.capacity = form.capacity ? parseInt(form.capacity) : null
        }
      } else if (t === 'collection') {
        extra = { method: form.method, purpose: form.purpose.trim() || null }
      } else if (t === 'ceremony') {
        extra = { award: form.award.trim() || null, honoreeIds: form.honoreeIds }
      } else if (t === 'program') {
        extra = { pageCount: form.pageCount ? parseInt(form.pageCount) : null, fileUrl: form.fileUrl.trim() || null }
      } else if (t === 'media') {
        extra = { mediaUrl: form.mediaUrl.trim() || null }
      }
      await onSave({ ...base, ...extra })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const t = form.type

  return (
    <Modal open={open} onClose={onClose} title={item ? 'Edit Item' : 'Add Runsheet Item'} width="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <Field label="Type" required>
            <select className={selectCls} value={form.type} onChange={e => set('type', e.target.value)}>
              {ITEM_TYPES.map(it => <option key={it} value={it}>{ITEM_TYPE_LABELS[it]}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Order">
              <input className={inputCls} type="number" value={form.order} onChange={e => set('order', e.target.value)} min="1" />
            </Field>
            <Field label="Duration (min)">
              <input className={inputCls} type="number" value={form.duration} onChange={e => set('duration', e.target.value)} min="1" placeholder="—" />
            </Field>
          </div>
        </div>

        <Field label="Label" required>
          <input className={inputCls} value={form.label} onChange={e => set('label', e.target.value)} placeholder="Item label or title" required />
        </Field>

        <Field label="Description">
          <input className={inputCls} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description..." />
        </Field>

        {/* Type-specific fields */}
        {(t === 'performance' || t === 'segment') && (
          <>
            <Field label="Songs / Selections">
              <input className={inputCls} value={form.songs} onChange={e => set('songs', e.target.value)} placeholder="Song 1, Song 2, ..." />
            </Field>
            {t === 'segment' && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Sub-location">
                  <input className={inputCls} value={form.location} onChange={e => set('location', e.target.value)} placeholder="Room / area" />
                </Field>
                <Field label="Capacity">
                  <input className={inputCls} type="number" value={form.capacity} onChange={e => set('capacity', e.target.value)} min="0" />
                </Field>
              </div>
            )}
            {people.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-church-textMuted mb-1.5">Individuals</p>
                <div className="border border-church-border max-h-32 overflow-y-auto">
                  {[...people].sort((a, b) => a.name.localeCompare(b.name)).map(p => (
                    <label key={p.id} className={`flex items-center gap-3 px-3 py-1.5 cursor-pointer ${form.personIds.includes(p.id) ? 'bg-church-gold/10' : 'hover:bg-church-background'}`}>
                      <input type="checkbox" checked={form.personIds.includes(p.id)} onChange={() => toggleId('personIds', p.id)} className="accent-church-gold" />
                      <span className="text-sm text-church-textMain">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {groups.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-church-textMuted mb-1.5">Groups</p>
                <div className="border border-church-border max-h-32 overflow-y-auto">
                  {[...groups].sort((a, b) => a.name.localeCompare(b.name)).map(g => (
                    <label key={g.id} className={`flex items-center gap-3 px-3 py-1.5 cursor-pointer ${form.groupIds.includes(g.id) ? 'bg-church-gold/10' : 'hover:bg-church-background'}`}>
                      <input type="checkbox" checked={form.groupIds.includes(g.id)} onChange={() => toggleId('groupIds', g.id)} className="accent-church-gold" />
                      <span className="text-sm text-church-textMain">{g.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {t === 'collection' && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Method">
              <select className={selectCls} value={form.method} onChange={e => set('method', e.target.value)}>
                {COLLECTION_METHODS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
              </select>
            </Field>
            <Field label="Purpose">
              <input className={inputCls} value={form.purpose} onChange={e => set('purpose', e.target.value)} placeholder="Building fund, missions..." />
            </Field>
          </div>
        )}

        {t === 'ceremony' && (
          <>
            <Field label="Award / Recognition">
              <input className={inputCls} value={form.award} onChange={e => set('award', e.target.value)} placeholder="Award name..." />
            </Field>
            {people.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-church-textMuted mb-1.5">Honorees</p>
                <div className="border border-church-border max-h-32 overflow-y-auto">
                  {[...people].sort((a, b) => a.name.localeCompare(b.name)).map(p => (
                    <label key={p.id} className={`flex items-center gap-3 px-3 py-1.5 cursor-pointer ${form.honoreeIds.includes(p.id) ? 'bg-church-gold/10' : 'hover:bg-church-background'}`}>
                      <input type="checkbox" checked={form.honoreeIds.includes(p.id)} onChange={() => toggleId('honoreeIds', p.id)} className="accent-church-gold" />
                      <span className="text-sm text-church-textMain">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {t === 'program' && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Page Count">
              <input className={inputCls} type="number" value={form.pageCount} onChange={e => set('pageCount', e.target.value)} min="0" />
            </Field>
            <Field label="File URL">
              <input className={inputCls} value={form.fileUrl} onChange={e => set('fileUrl', e.target.value)} placeholder="https://..." />
            </Field>
          </div>
        )}

        {t === 'media' && (
          <Field label="Media URL">
            <input className={inputCls} value={form.mediaUrl} onChange={e => set('mediaUrl', e.target.value)} placeholder="https://..." />
          </Field>
        )}

        <Field label="Notes">
          <input className={inputCls} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Staff notes..." />
        </Field>

        <FormActions onCancel={onClose} submitLabel={item ? 'Update Item' : 'Add to Runsheet'} loading={saving} />
      </form>
    </Modal>
  )
}
