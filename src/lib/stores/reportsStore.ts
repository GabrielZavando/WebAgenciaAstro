import { atom } from 'nanostores';
import type { ReportResponseDto } from '../../types/api';

/**
 * Store reactivo para la gestión de informes
 * Actúa como un Observable para que los componentes se suscriban a los cambios
 */
export const reportsStore = atom<ReportResponseDto[]>([]);

/**
 * Inyecta una lista completa de informes (ej: carga inicial del API)
 */
export const setReports = (reports: ReportResponseDto[]) => {
  reportsStore.set(reports);
};

/**
 * Inyecta un único informe al principio de la lista (Real-time injection)
 */
export const addReport = (report: ReportResponseDto) => {
  const current = reportsStore.get();
  reportsStore.set([report, ...current]);
};

/**
 * Elimina un informe de la lista reactiva
 */
export const removeReport = (reportId: string) => {
  const current = reportsStore.get();
  reportsStore.set(current.filter(r => r.id !== reportId));
};
