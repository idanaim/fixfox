export interface User {
  id: number;
  name: string;
  email: string;
  accountId?: string;
  role?: string;
  mobile?: string;
  permissions?: string[];
  photoUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
} 