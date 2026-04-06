/**
 * Utilidades para el manejo de fechas en el frontend.
 * Soporta Timestamps de Firestore ({ _seconds, _nanoseconds }), ISO Strings y objetos Date.
 */
export function formatDate(raw: any, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }): string {
  if (!raw) return 'Desconocida';
  
  let date: Date;
  
  if (raw instanceof Date) {
    date = raw;
  } else if (raw?._seconds !== undefined) {
    // Caso de Firebase Timestamp deserializado
    date = new Date(raw._seconds * 1000);
  } else if (typeof raw === 'string' || typeof raw === 'number') {
    date = new Date(raw);
  } else {
    return 'Formato inválido';
  }

  if (isNaN(date.getTime())) return 'Fecha inválida';

  return new Intl.DateTimeFormat('es-AR', options).format(date);
}

/**
 * Retorna un timestamp en milisegundos a partir de diversos formatos.
 */
export function getTimestamp(raw: any): number {
  if (!raw) return 0;
  if (raw instanceof Date) return raw.getTime();
  if (raw?._seconds !== undefined) return raw._seconds * 1000;
  return new Date(raw).getTime();
}
