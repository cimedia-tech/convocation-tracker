import { useState, useEffect } from 'react'
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc,
} from 'firebase/firestore'
import { db } from '../firebase/config'

// ─────────────────────────────────────────────
// Constants (mirrors types.ts values for JSX consumers)
// ─────────────────────────────────────────────

export const ROLE_LABELS = {
  musician: 'Musician', choirDirector: 'Choir Director', praiseLeader: 'Praise Leader',
  organist: 'Organist', drummer: 'Drummer', bassPlayer: 'Bass Player', keys: 'Keys',
  preacher: 'Preacher', teacher: 'Teacher', guestSpeaker: 'Guest Speaker', keynote: 'Keynote',
  emcee: 'Emcee', host: 'Host', welcome: 'Welcome', prayer: 'Prayer',
  benediction: 'Benediction', invocation: 'Invocation', scriptureReading: 'Scripture Reading',
  altarCall: 'Altar Call', ushers: 'Ushers', security: 'Security', media: 'Media',
  livestream: 'Livestream', photographer: 'Photographer', sound: 'Sound',
  spokesman: 'Spokesman', presenter: 'Presenter', awards: 'Awards', announcements: 'Announcements',
}

export const ROLE_CATEGORIES = {
  Music:        ['musician', 'choirDirector', 'praiseLeader', 'organist', 'drummer', 'bassPlayer', 'keys'],
  Word:         ['preacher', 'teacher', 'guestSpeaker', 'keynote'],
  Ceremony:     ['emcee', 'host', 'welcome', 'prayer', 'benediction', 'invocation', 'scriptureReading', 'altarCall'],
  Logistics:    ['ushers', 'security', 'media', 'livestream', 'photographer', 'sound'],
  Organization: ['spokesman', 'presenter', 'awards', 'announcements'],
}

export const GROUP_TYPE_LABELS = {
  choir: 'Choir', band: 'Band', ensemble: 'Ensemble', praise: 'Praise Team',
  orchestra: 'Orchestra', mission: 'Mission', committee: 'Committee',
  ministry: 'Ministry', department: 'Department', other: 'Other',
}

export const ITEM_TYPE_LABELS = {
  program: 'Program', performance: 'Performance', segment: 'Segment',
  collection: 'Collection / Offering', break: 'Break', ceremony: 'Ceremony',
  announcement: 'Announcement', media: 'Media', other: 'Other',
}

export const SESSION_STATUS_LABELS = {
  draft: 'Draft', confirmed: 'Confirmed', live: 'Live',
  completed: 'Completed', cancelled: 'Cancelled',
}

// ─────────────────────────────────────────────
// Audit helpers
// ─────────────────────────────────────────────

function nowISO() { return new Date().toISOString() }

function auditMeta(userId) {
  const now = nowISO()
  return { createdAt: now, updatedAt: now, createdBy: userId || null, updatedBy: userId || null }
}

function touchMeta(userId) {
  return { 'meta.updatedAt': nowISO(), 'meta.updatedBy': userId || null }
}

// ─────────────────────────────────────────────
// People
// ─────────────────────────────────────────────

export function usePeople() {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'people'),
      snap => { setPeople(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false) },
      () => setLoading(false)
    )
    return unsub
  }, [])
  return { people, loading }
}

export async function addPerson(data, userId) {
  return addDoc(collection(db, 'people'), {
    isActive: true, primaryRoles: [], tags: [], ...data, meta: auditMeta(userId),
  })
}

export async function updatePerson(id, data, userId) {
  return updateDoc(doc(db, 'people', id), { ...data, ...touchMeta(userId) })
}

export async function deletePerson(id) {
  return deleteDoc(doc(db, 'people', id))
}

// ─────────────────────────────────────────────
// Groups
// ─────────────────────────────────────────────

export function useGroups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'groups'),
      snap => { setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false) },
      () => setLoading(false)
    )
    return unsub
  }, [])
  return { groups, loading }
}

export async function addGroup(data, userId) {
  return addDoc(collection(db, 'groups'), {
    isActive: true, memberIds: [], ...data, meta: auditMeta(userId),
  })
}

export async function updateGroup(id, data, userId) {
  return updateDoc(doc(db, 'groups', id), { ...data, ...touchMeta(userId) })
}

export async function deleteGroup(id) {
  return deleteDoc(doc(db, 'groups', id))
}

// ─────────────────────────────────────────────
// Convocations
// ─────────────────────────────────────────────

export function useConvocations() {
  const [convocations, setConvocations] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'convocations'),
      snap => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        docs.sort((a, b) => (b.year || 0) - (a.year || 0))
        setConvocations(docs)
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsub
  }, [])
  return { convocations, loading }
}

export function useConvocation(convocationId) {
  const [convocation, setConvocation] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!convocationId) { setLoading(false); return }
    const unsub = onSnapshot(
      doc(db, 'convocations', convocationId),
      snap => { setConvocation(snap.exists() ? { id: snap.id, ...snap.data() } : null); setLoading(false) },
      () => setLoading(false)
    )
    return unsub
  }, [convocationId])
  return { convocation, loading }
}

export async function addConvocation(data, userId) {
  return addDoc(collection(db, 'convocations'), {
    year: new Date().getFullYear(), tags: [], ...data, meta: auditMeta(userId),
  })
}

export async function updateConvocation(id, data, userId) {
  return updateDoc(doc(db, 'convocations', id), { ...data, ...touchMeta(userId) })
}

export async function deleteConvocation(id) {
  return deleteDoc(doc(db, 'convocations', id))
}

// ─────────────────────────────────────────────
// Days
// ─────────────────────────────────────────────

export function useDays(convocationId) {
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!convocationId) { setLoading(false); return }
    const q = query(collection(db, 'days'), where('convocationId', '==', convocationId))
    const unsub = onSnapshot(
      q,
      snap => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        docs.sort((a, b) => (a.date || '').localeCompare(b.date || ''))
        setDays(docs)
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsub
  }, [convocationId])
  return { days, loading }
}

export async function addDay(data, userId) {
  return addDoc(collection(db, 'days'), {
    tags: [], sessionIds: [], ...data, meta: auditMeta(userId),
  })
}

export async function updateDay(id, data, userId) {
  return updateDoc(doc(db, 'days', id), { ...data, ...touchMeta(userId) })
}

export async function deleteDay(id) {
  return deleteDoc(doc(db, 'days', id))
}

// ─────────────────────────────────────────────
// Sessions
// ─────────────────────────────────────────────

export function useSessions(dayId) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!dayId) { setLoading(false); return }
    const q = query(collection(db, 'sessions'), where('dayId', '==', dayId))
    const unsub = onSnapshot(
      q,
      snap => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        docs.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
        setSessions(docs)
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsub
  }, [dayId])
  return { sessions, loading }
}

export function useSession(sessionId) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!sessionId) { setLoading(false); return }
    const unsub = onSnapshot(
      doc(db, 'sessions', sessionId),
      snap => { setSession(snap.exists() ? { id: snap.id, ...snap.data() } : null); setLoading(false) },
      () => setLoading(false)
    )
    return unsub
  }, [sessionId])
  return { session, loading }
}

export async function addSession(data, userId) {
  return addDoc(collection(db, 'sessions'), {
    status: 'draft', tags: [], roles: [], items: [], ...data, meta: auditMeta(userId),
  })
}

export async function updateSession(id, data, userId) {
  return updateDoc(doc(db, 'sessions', id), { ...data, ...touchMeta(userId) })
}

export async function deleteSession(id) {
  return deleteDoc(doc(db, 'sessions', id))
}
