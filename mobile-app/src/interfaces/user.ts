export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  mobile?: string;
  permissions?: string[];
  photoUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
} 