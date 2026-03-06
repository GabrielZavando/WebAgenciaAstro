
interface FirebaseTimestamp {
  _seconds: number
}

type RawDate = string | FirebaseTimestamp | null | undefined

interface StatusInfo {
  label: string
  className: string
  icon: string
}

interface PriorityInfo {
  label: string
  color: string
}

const STATUS_MAP: Record<string, StatusInfo> = {
  open: {
    label: 'Enviado',
    className: 'status-open',
    icon: 'fas fa-paper-plane',
  },
  'in-progress': {
    label: 'En progreso',
    className: 'status-progress',
    icon: 'fas fa-hourglass-half',
  },
  resolved: {
    label: 'Resuelto',
    className: 'status-resolved',
    icon: 'fas fa-check',
  },
}

const PRIORITY_MAP: Record<string, PriorityInfo> = {
  low: { label: 'Baja', color: '#22c55e' },
  medium: { label: 'Media', color: '#f59e0b' },
  high: { label: 'Alta', color: '#ef4444' },
}

export function formatDate(raw: RawDate): string {
  if (!raw) return '-'
  let d: Date
  if (typeof raw === 'string') {
    d = new Date(raw)
  } else {
    d = new Date(raw._seconds * 1000)
  }
  const months = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
  ]
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export function getStatusInfo(status: string): StatusInfo {
  return STATUS_MAP[status] ?? STATUS_MAP.open
}

export function getPriorityInfo(priority: string): PriorityInfo {
  return PRIORITY_MAP[priority] ?? PRIORITY_MAP.medium
}

export function getRawDate(raw: RawDate): Date {
  if (!raw) return new Date(0)
  if (typeof raw === 'string') return new Date(raw)
  return new Date(raw._seconds * 1000)
}
