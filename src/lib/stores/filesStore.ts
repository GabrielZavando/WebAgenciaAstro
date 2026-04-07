import { atom } from 'nanostores';
import type { FileResponseDto, StorageQuotaDto } from '../../types/api';

/**
 * Store reactivo para la lista de archivos
 */
export const filesStore = atom<FileResponseDto[]>([]);

/**
 * Store reactivo para la cuota de almacenamiento
 */
export const quotaStore = atom<StorageQuotaDto | null>(null);

/**
 * Inyecta una lista completa de archivos
 */
export const setFiles = (files: FileResponseDto[]) => {
  filesStore.set(files);
};

/**
 * Inyecta un nuevo archivo al principio de la lista
 */
export const addFile = (file: FileResponseDto) => {
  const current = filesStore.get();
  filesStore.set([file, ...current]);
};

/**
 * Elimina un archivo de la lista reactiva
 */
export const removeFile = (id: string) => {
  const current = filesStore.get();
  filesStore.set(current.filter(f => f.id !== id));
};

/**
 * Actualiza la información de cuota de almacenamiento
 */
export const updateQuota = (quota: StorageQuotaDto) => {
  quotaStore.set(quota);
};
