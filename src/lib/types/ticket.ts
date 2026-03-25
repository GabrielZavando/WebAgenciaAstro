export interface Ticket {
  id: string;
  clientId: string;
  clientName?: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  serviceType: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  messages?: Array<{
    id?: string;
    senderId: string;
    senderType: 'client' | 'admin';
    content: string;
    createdAt: string | Date;
  }>;
}
