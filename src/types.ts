/**
 * Convocation Tracker — Type System v2
 *
 * 10x improvements over v1:
 *  - Branded ID types prevent mixing up personId / groupId / sessionId
 *  - Discriminated unions for roles and session items replace loose strings
 *  - Full audit trail (createdAt, updatedAt, createdBy)
 *  - Rich media, contact, and status metadata
 *  - Hierarchical event model: Convocation → Week → Day → Session → Item
 *  - Zod schemas for runtime validation at API/Firebase boundaries
 *  - Const objects replace plain string unions (tree-shakeable, iterable)
 */

import { z } from 'zod'

// ─────────────────────────────────────────────
// § 1. BRANDED PRIMITIVES
// ─────────────────────────────────────────────

/** Nominal ID types prevent mixing personId into a groupId slot, etc. */
type Brand<T, B> = T & { readonly __brand: B }

export type PersonId    = Brand<string, 'PersonId'>
export type GroupId     = Brand<string, 'GroupId'>
export type SessionId   = Brand<string, 'SessionId'>
export type SessionItemId = Brand<string, 'SessionItemId'>
export type DayId       = Brand<string, 'DayId'>
export type WeekId      = Brand<string, 'WeekId'>
export type ConvocationId = Brand<string, 'ConvocationId'>
export type UserId      = Brand<string, 'UserId'>

/** ISO-8601 date string, e.g. "2025-04-10" */
export type ISODate = Brand<string, 'ISODate'>

/** 24-hour time string, e.g. "16:00" */
export type Time24 = Brand<string, 'Time24'>

/** Duration in minutes */
export type Minutes = Brand<number, 'Minutes'>

// ─────────────────────────────────────────────
// § 2. ROLES — Discriminated Union
// ─────────────────────────────────────────────

/** Every possible role a person can serve in a session. */
export const ROLES = {
  // Music
  MUSICIAN:          'musician',
  CHOIR_DIRECTOR:    'choirDirector',
  PRAISE_LEADER:     'praiseLeader',
  ORGANIST:          'organist',
  DRUMMER:           'drummer',
  BASS_PLAYER:       'bassPlayer',
  KEYS:              'keys',

  // Word
  PREACHER:          'preacher',
  TEACHER:           'teacher',
  GUEST_SPEAKER:     'guestSpeaker',
  KEYNOTE:           'keynote',

  // Ceremony
  EMCEE:             'emcee',
  HOST:              'host',
  WELCOME:           'welcome',
  PRAYER:            'prayer',
  BENEDICTION:       'benediction',
  INVOCATION:        'invocation',
  SCRIPTURE_READING: 'scriptureReading',
  ALTAR_CALL:        'altarCall',

  // Logistics
  USHERS:            'ushers',
  SECURITY:          'security',
  MEDIA:             'media',
  LIVESTREAM:        'livestream',
  PHOTOGRAPHER:      'photographer',
  SOUND:             'sound',

  // Organization
  SPOKESMAN:         'spokesman',
  PRESENTER:         'presenter',
  AWARDS:            'awards',
  ANNOUNCEMENTS:     'announcements',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

/** Human-readable labels for every role */
export const ROLE_LABELS: Record<Role, string> = {
  musician:          'Musician',
  choirDirector:     'Choir Director',
  praiseLeader:      'Praise & Worship Leader',
  organist:          'Organist',
  drummer:           'Drummer',
  bassPlayer:        'Bass Player',
  keys:              'Keys / Piano',
  preacher:          'Preacher',
  teacher:           'Teacher',
  guestSpeaker:      'Guest Speaker',
  keynote:           'Keynote Speaker',
  emcee:             'Emcee',
  host:              'Host',
  welcome:           'Welcome',
  prayer:            'Prayer',
  benediction:       'Benediction',
  invocation:        'Invocation',
  scriptureReading:  'Scripture Reading',
  altarCall:         'Altar Call',
  ushers:            'Ushers',
  security:          'Security',
  media:             'Media',
  livestream:        'Livestream',
  photographer:      'Photographer',
  sound:             'Sound',
  spokesman:         'Spokesman',
  presenter:         'Presenter',
  awards:            'Awards',
  announcements:     'Announcements',
}

// ─────────────────────────────────────────────
// § 3. PEOPLE
// ─────────────────────────────────────────────

export interface ContactInfo {
  phone?:    string
  email?:    string
  social?:   Record<string, string>  // { instagram: '@handle', ... }
}

export interface Person {
  id:          PersonId
  name:        string
  /** Formal title: "Bishop", "Elder", "Dr.", "Sis.", etc. */
  title?:      string
  /** Suffix: "Jr.", "III" */
  suffix?:     string
  /** Organization / church affiliation */
  organization?: string
  /** City, State */
  location?:   string
  bio?:        string
  photoUrl?:   string
  contact?:    ContactInfo
  /**
   * Primary roles this person commonly fills — used for search / autocomplete.
   * The roles they actually serve are recorded per-session in SessionRole.
   */
  primaryRoles?: Role[]
  tags?:       string[]
  isActive:    boolean
  meta:        AuditMeta
}

// ─────────────────────────────────────────────
// § 4. GROUPS
// ─────────────────────────────────────────────

export const GROUP_TYPES = {
  CHOIR:      'choir',
  BAND:       'band',
  ENSEMBLE:   'ensemble',
  PRAISE:     'praise',
  ORCHESTRA:  'orchestra',
  MISSION:    'mission',
  COMMITTEE:  'committee',
  MINISTRY:   'ministry',
  DEPARTMENT: 'department',
  OTHER:      'other',
} as const

export type GroupType = typeof GROUP_TYPES[keyof typeof GROUP_TYPES]

export interface Group {
  id:           GroupId
  name:         string
  type:         GroupType
  location?:    string
  /** Church or organization this group belongs to */
  organization?: string
  directorId?:  PersonId
  memberIds:    PersonId[]
  photoUrl?:    string
  bio?:         string
  isActive:     boolean
  meta:         AuditMeta
}

// ─────────────────────────────────────────────
// § 5. SESSION ROLES — Rich Assignment
// ─────────────────────────────────────────────

/**
 * A person assigned to a specific role IN a specific session.
 * The discriminated `subject` field allows a role to be filled
 * by either a person OR a group (e.g., a choir fills 'musician').
 */
export type SessionRole =
  | { role: Role; subject: 'person'; personId: PersonId;  notes?: string; confirmed?: boolean }
  | { role: Role; subject: 'group';  groupId: GroupId;    notes?: string; confirmed?: boolean }

// ─────────────────────────────────────────────
// § 6. SESSION ITEMS — Discriminated Program Blocks
// ─────────────────────────────────────────────

export const ITEM_TYPES = {
  PROGRAM:     'program',   // A printed program / event booklet
  PERFORMANCE: 'performance', // Music, drama, spoken word
  SEGMENT:     'segment',   // Named time block: "Tent Meeting", "Workshop"
  COLLECTION:  'collection', // Offering / tithe
  BREAK:       'break',     // Intermission
  CEREMONY:    'ceremony',  // Award, ordination, installation
  ANNOUNCEMENT: 'announcement',
  MEDIA:       'media',     // Video, slideshow
  OTHER:       'other',
} as const

export type ItemType = typeof ITEM_TYPES[keyof typeof ITEM_TYPES]

interface BaseSessionItem {
  id:           SessionItemId
  type:         ItemType
  label:        string
  description?: string
  /** Sort order within the session */
  order:        number
  /** Estimated duration in minutes */
  duration?:    Minutes
  notes?:       string
}

export interface ProgramItem extends BaseSessionItem {
  type:       'program'
  pageCount?: number
  fileUrl?:   string
}

export interface PerformanceItem extends BaseSessionItem {
  type:       'performance'
  groupIds?:  GroupId[]
  personIds?: PersonId[]
  songs?:     string[]
}

export interface SegmentItem extends BaseSessionItem {
  type:       'segment'
  groupIds?:  GroupId[]
  location?:  string
  capacity?:  number
}

export interface CollectionItem extends BaseSessionItem {
  type:       'collection'
  method?:    'plate' | 'envelope' | 'digital' | 'buckets'
  purpose?:   string
}

export interface CeremonyItem extends BaseSessionItem {
  type:        'ceremony'
  honoreeIds?: PersonId[]
  award?:      string
}

export interface GenericItem extends BaseSessionItem {
  type: 'break' | 'announcement' | 'media' | 'other'
  groupIds?:  GroupId[]
  personIds?: PersonId[]
  mediaUrl?:  string
}

/** A program block inside a session — strongly typed by `type` */
export type SessionItem =
  | ProgramItem
  | PerformanceItem
  | SegmentItem
  | CollectionItem
  | CeremonyItem
  | GenericItem

// ─────────────────────────────────────────────
// § 7. SESSION
// ─────────────────────────────────────────────

export const SESSION_STATUS = {
  DRAFT:      'draft',
  CONFIRMED:  'confirmed',
  LIVE:       'live',
  COMPLETED:  'completed',
  CANCELLED:  'cancelled',
} as const

export type SessionStatus = typeof SESSION_STATUS[keyof typeof SESSION_STATUS]

export interface Session {
  id:           SessionId
  dayId:        DayId
  title:        string
  theme?:       string
  status:       SessionStatus

  date:         ISODate
  startTime?:   Time24
  endTime?:     Time24

  location?:    string
  cityState?:   string
  venue?:       string
  capacity?:    number

  tags:         string[]

  /** Music/worship that plays before the official start */
  preMusic?:    string

  roles:        SessionRole[]
  items:        SessionItem[]

  /** Free-form notes for organizers */
  internalNotes?: string

  /** Displayed publicly on programs, livestream, etc. */
  publicDescription?: string

  livestreamUrl?: string

  meta:         AuditMeta
}

// ─────────────────────────────────────────────
// § 8. DAY SCHEDULE
// ─────────────────────────────────────────────

export const DAY_HIGHLIGHT = {
  OPENING_NIGHT:     'Opening Night',
  YOUTH_NIGHT:       'Youth Night',
  HOMECOMING:        'Homecoming',
  HOLY_CONVOCATION:  'Holy Convocation',
  WOMEN_DAY:         "Women's Day",
  MEN_DAY:           "Men's Day",
  MISSIONS_DAY:      'Missions Day',
  CLOSING_NIGHT:     'Closing Night',
  COMMUNITY_DAY:     'Community Day',
} as const

export type DayHighlight = typeof DAY_HIGHLIGHT[keyof typeof DAY_HIGHLIGHT]

export interface DaySchedule {
  id:           DayId
  weekId?:      WeekId
  date:         ISODate
  label:        string        // "Saturday, April 10"
  highlight?:   DayHighlight | string  // allow custom
  theme?:       string
  tags:         string[]
  sessionIds:   SessionId[]
  coverImageUrl?: string
  meta:         AuditMeta
}

// ─────────────────────────────────────────────
// § 9. WEEK (optional grouping above Day)
// ─────────────────────────────────────────────

export interface Week {
  id:      WeekId
  label:   string   // "Week 1 — Revival", "Holy Convocation Week"
  startDate: ISODate
  endDate:   ISODate
  theme?:  string
  dayIds:  DayId[]
  meta:    AuditMeta
}

// ─────────────────────────────────────────────
// § 10. CONVOCATION (top-level event container)
// ─────────────────────────────────────────────

export interface Convocation {
  id:           ConvocationId
  name:         string        // "2025 Annual Holy Convocation"
  year:         number
  theme?:       string
  startDate:    ISODate
  endDate:      ISODate
  location?:    string
  cityState?:   string
  websiteUrl?:  string
  logoUrl?:     string
  bannerUrl?:   string
  weekIds:      WeekId[]
  tags:         string[]
  meta:         AuditMeta
}

// ─────────────────────────────────────────────
// § 11. AUDIT METADATA
// ─────────────────────────────────────────────

export interface AuditMeta {
  createdAt:  string   // ISO timestamp (Firebase Timestamp serialized)
  updatedAt:  string
  createdBy?: UserId
  updatedBy?: UserId
}

// ─────────────────────────────────────────────
// § 12. ZOD SCHEMAS — Runtime Validation
//        (validates data coming from Firebase / API)
// ─────────────────────────────────────────────

const roleValues = Object.values(ROLES) as [Role, ...Role[]]
const groupTypeValues = Object.values(GROUP_TYPES) as [GroupType, ...GroupType[]]
const itemTypeValues = Object.values(ITEM_TYPES) as [ItemType, ...ItemType[]]
const sessionStatusValues = Object.values(SESSION_STATUS) as [SessionStatus, ...SessionStatus[]]

const AuditMetaSchema = z.object({
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
})

export const PersonSchema = z.object({
  id:           z.string(),
  name:         z.string().min(1),
  title:        z.string().optional(),
  suffix:       z.string().optional(),
  organization: z.string().optional(),
  location:     z.string().optional(),
  bio:          z.string().optional(),
  photoUrl:     z.string().url().optional(),
  contact:      z.object({
    phone:   z.string().optional(),
    email:   z.string().email().optional(),
    social:  z.record(z.string()).optional(),
  }).optional(),
  primaryRoles: z.array(z.enum(roleValues)).optional(),
  tags:         z.array(z.string()).optional(),
  isActive:     z.boolean(),
  meta:         AuditMetaSchema,
})

export const GroupSchema = z.object({
  id:           z.string(),
  name:         z.string().min(1),
  type:         z.enum(groupTypeValues),
  location:     z.string().optional(),
  organization: z.string().optional(),
  directorId:   z.string().optional(),
  memberIds:    z.array(z.string()),
  photoUrl:     z.string().url().optional(),
  bio:          z.string().optional(),
  isActive:     z.boolean(),
  meta:         AuditMetaSchema,
})

export const SessionRoleSchema = z.discriminatedUnion('subject', [
  z.object({
    role:      z.enum(roleValues),
    subject:   z.literal('person'),
    personId:  z.string(),
    notes:     z.string().optional(),
    confirmed: z.boolean().optional(),
  }),
  z.object({
    role:     z.enum(roleValues),
    subject:  z.literal('group'),
    groupId:  z.string(),
    notes:    z.string().optional(),
    confirmed: z.boolean().optional(),
  }),
])

export const SessionItemSchema = z.object({
  id:          z.string(),
  type:        z.enum(itemTypeValues),
  label:       z.string().min(1),
  description: z.string().optional(),
  order:       z.number().int().nonnegative(),
  duration:    z.number().int().positive().optional(),
  notes:       z.string().optional(),
  // shared optional fields across subtypes
  groupIds:    z.array(z.string()).optional(),
  personIds:   z.array(z.string()).optional(),
  songs:       z.array(z.string()).optional(),
  fileUrl:     z.string().url().optional(),
  mediaUrl:    z.string().url().optional(),
  location:    z.string().optional(),
  honoreeIds:  z.array(z.string()).optional(),
  award:       z.string().optional(),
  purpose:     z.string().optional(),
})

export const SessionSchema = z.object({
  id:                 z.string(),
  dayId:              z.string(),
  title:              z.string().min(1),
  theme:              z.string().optional(),
  status:             z.enum(sessionStatusValues),
  date:               z.string(),
  startTime:          z.string().optional(),
  endTime:            z.string().optional(),
  location:           z.string().optional(),
  cityState:          z.string().optional(),
  venue:              z.string().optional(),
  capacity:           z.number().int().positive().optional(),
  tags:               z.array(z.string()),
  preMusic:           z.string().optional(),
  roles:              z.array(SessionRoleSchema),
  items:              z.array(SessionItemSchema),
  internalNotes:      z.string().optional(),
  publicDescription:  z.string().optional(),
  livestreamUrl:      z.string().url().optional(),
  meta:               AuditMetaSchema,
})

export const DayScheduleSchema = z.object({
  id:             z.string(),
  weekId:         z.string().optional(),
  date:           z.string(),
  label:          z.string().min(1),
  highlight:      z.string().optional(),
  theme:          z.string().optional(),
  tags:           z.array(z.string()),
  sessionIds:     z.array(z.string()),
  coverImageUrl:  z.string().url().optional(),
  meta:           AuditMetaSchema,
})

// ─────────────────────────────────────────────
// § 13. UTILITY TYPES
// ─────────────────────────────────────────────

/** Omit id + meta for create payloads */
export type CreatePayload<T extends { id: unknown; meta: unknown }> =
  Omit<T, 'id' | 'meta'>

/** Allow partial fields + always carry id for update payloads */
export type UpdatePayload<T extends { id: unknown; meta: unknown }> =
  Partial<Omit<T, 'id' | 'meta'>> & { id: T['id'] }

/** Resolved session — all IDs replaced with full objects */
export interface ResolvedSession extends Omit<Session, 'roles' | 'items'> {
  roles: Array<
    | { role: Role; subject: 'person'; person: Person;  notes?: string; confirmed?: boolean }
    | { role: Role; subject: 'group';  group: Group;    notes?: string; confirmed?: boolean }
  >
  items: SessionItem[]
}

/** Flat "program row" — useful for rendering a printable program */
export interface ProgramRow {
  order:      number
  label:      string
  performer?: string   // person or group display name
  duration?:  Minutes
  notes?:     string
}
