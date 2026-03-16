const STATUS_STYLES = {
  'Not Started':  'bg-gray-100 text-gray-600 border-gray-300',
  'Assigned':     'bg-blue-100 text-blue-700 border-blue-300',
  'In Progress':  'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Draft':        'bg-orange-100 text-orange-700 border-orange-300',
  'Complete':     'bg-green-100 text-green-700 border-green-300',
  'Under Review': 'bg-purple-100 text-purple-700 border-purple-300',
  'Final':        'bg-teal-100 text-teal-700 border-teal-300',
  'Approved':     'bg-church-navy text-church-gold border-church-gold',
}

export const STATUS_OPTIONS = [
  'Not Started', 'Assigned', 'In Progress', 'Draft',
  'Complete', 'Under Review', 'Final', 'Approved'
]

// Weight for completion percentage (Approved = 100%)
export const STATUS_WEIGHT = {
  'Not Started': 0,
  'Assigned': 10,
  'In Progress': 25,
  'Draft': 50,
  'Complete': 65,
  'Under Review': 80,
  'Final': 90,
  'Approved': 100,
}

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES['Not Started']
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full border ${style}`}>
      {status}
    </span>
  )
}
