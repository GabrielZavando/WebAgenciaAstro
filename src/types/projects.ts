export interface Client {
  id: string
  displayName: string
  email: string
  role?: string
}

export interface Project {
  id: string
  name: string
  clientId: string
  status: string
  percentage: number
  description: string
  createdAt?: any
  updatedAt?: any
}
