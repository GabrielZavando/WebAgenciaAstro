export interface User {
  id: string;
  uid?: string;
  name: string;
  email: string;
  role: 'admin' | 'client' | 'superadmin';
  status: 'active' | 'inactive';
  createdAt?: Date | string | number;
  lastLogin?: Date | string | number;
  phone?: string;
  [key: string]: unknown;
}
