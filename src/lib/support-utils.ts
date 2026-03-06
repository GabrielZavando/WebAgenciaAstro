
export function formatDate(raw: any): string {
  if (!raw) return '-';
  let d = new Date();
  if (typeof raw === 'string') d = new Date(raw);
  else if (raw._seconds) d = new Date(raw._seconds * 1000);
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function getStatusInfo(status: string) {
  const map: any = {
    open: { label: 'Enviado', className: 'status-open', icon: 'fas fa-paper-plane' },
    'in-progress': { label: 'En progreso', className: 'status-progress', icon: 'fas fa-hourglass-half' },
    resolved: { label: 'Resuelto', className: 'status-resolved', icon: 'fas fa-check' },
  };
  return map[status] || map.open;
}

export function getPriorityInfo(priority: string) {
  const map: any = {
    low: { label: 'Baja', color: '#22c55e' },
    medium: { label: 'Media', color: '#f59e0b' },
    high: { label: 'Alta', color: '#ef4444' },
  };
  return map[priority] || map.medium;
}

export function getRawDate(raw: any): Date {
  if (!raw) return new Date(0);
  if (typeof raw === 'string') return new Date(raw);
  if (raw._seconds) return new Date(raw._seconds * 1000);
  return new Date(0);
}
