export interface Project {
  id: string;
  clientId: string;
  clientName?: string;
  name: string;
  title?: string;
  description: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold';
  progress: number;
  startDate: string | Date;
  endDate?: string | Date;
  budget?: number;
  tasks?: Array<{ id: string; name: string; completed: boolean }>;
}
