import { ROLE_LABELS, ROLE_CATEGORIES } from '../hooks/useConvocationData'

const CATEGORY_COLORS = {
  Music:        'bg-purple-900/40 text-purple-300 border-purple-800/60',
  Word:         'bg-amber-900/40 text-church-gold border-church-gold/30',
  Ceremony:     'bg-blue-900/40 text-blue-300 border-blue-800/60',
  Logistics:    'bg-green-900/40 text-green-300 border-green-800/60',
  Organization: 'bg-church-surface text-church-textMuted border-church-border',
}

function getRoleCategory(role) {
  for (const [cat, roles] of Object.entries(ROLE_CATEGORIES)) {
    if (roles.includes(role)) return cat
  }
  return 'Organization'
}

export default function RoleBadge({ role, size = 'sm' }) {
  const label = ROLE_LABELS[role] || role
  const cat = getRoleCategory(role)
  const color = CATEGORY_COLORS[cat]
  return (
    <span className={`inline-flex items-center border px-2 py-0.5 font-mono uppercase tracking-wider whitespace-nowrap ${color} ${size === 'xs' ? 'text-[9px]' : 'text-[10px]'}`}>
      {label}
    </span>
  )
}

export { getRoleCategory, CATEGORY_COLORS }
