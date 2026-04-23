/**
 * Sincronización de Interfaces con el Backend (DTOs de NestJS)
 * 100% Estandarizado - Unificación de campos 'id'
 */

export interface ClientResponseDto {
  id: string
  displayName: string
  email: string
  photoURL?: string
  role: 'client' | 'admin'
  phoneNumber?: string
  companyName?: string
  storageLimitBytes?: number
  createdAt: { _seconds: number; _nanoseconds: number } | string | Date
}

export interface TicketResponseDto {
  id: string
  subject: string
  message: string
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'in-progress' | 'resolved'
  adminResponse?: string
  clientEmail: string
  clientId: string
  clientName?: string
  clientPhotoUrl?: string
  projectId?: string
  projectName?: string
  attachmentUrl?: string
  createdAt: any
  updatedAt: any
}

export interface MessageResponseDto {
  id: string
  ticketId: string
  body: string
  senderRole: 'admin' | 'client'
  senderPhotoUrl?: string
  attachmentUrl?: string
  createdAt: any
}

export interface FileResponseDto {
  id: string
  ownerId: string
  title: string
  description: string
  fileName: string
  storagePath: string
  mimeType: string
  size: number
  isPublic: boolean
  createdAt: any
}

export interface ConsultaResponse {
  consultaId: string
  asunto?: string
  fecha: any
  contenido: string
  estado: 'respondida_automaticamente' | 'no_respondida' | 'respondida_manualmente'
  respuesta?: {
    fecha: any
    contenido: string
    emailSent: boolean
  }
}

export interface DiagnosticoResponse {
  diagnosticoId: string
  respuestas: boolean[]
  estado: 'enviado' | 'no_enviado'
  contenido: any
  createdAt: any
}

export interface ContactoResponseDto {
  id: string
  name: string
  email: string
  empresa?: string
  industria?: string
  phone?: string
  origen: string
  status: string
  consultas?: ConsultaResponse[]
  diagnosticos?: DiagnosticoResponse[]
  createdAt: any
  updatedAt: any
}

export interface ProspectResponseDto {
  id: string
  name: string
  email: string
  phone?: string
  message: string
  status: string
  conversations: any[]
  createdAt: any
  updatedAt: any
}

export interface SubscriberResponseDto {
  id: string
  email: string
  status: 'pending' | 'sent' | 'confirmed' | 'unconfirmed' | 'inactive' | 'unsubscribed'
  subscribedAt: any
  confirmedAt?: any
}

export interface ProjectResponseDto {
  id: string
  name: string
  description: string
  monthlyTicketLimit: number
  clientId: string
  clientName?: string
  status: string
  percentage: number
  createdAt: any
  updatedAt: any
}

export interface ReportResponseDto {
  id: string
  clientId: string
  clientName?: string
  projectId?: string
  projectName?: string
  title: string
  description: string
  fileUrl?: string
  createdAt: any
}

export interface StorageQuotaDto {
  usedBytes: number
  limitBytes: number
  usedFormatted: string
  limitFormatted: string
}
