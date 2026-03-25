export interface Report {
  id: string;
  clientId: string;
  clientName?: string;
  title: string;
  month: number;
  year: number;
  fileUrl: string;
  fileName: string;
  uploadedAt: string | Date;
}
