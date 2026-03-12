export interface Client {
  uid: string
  id: string
  displayName: string
  email: string
}

export interface Project {
  id: string
  name: string
  clientUid: string
  status: string
  percentage: number
  description: string
}
