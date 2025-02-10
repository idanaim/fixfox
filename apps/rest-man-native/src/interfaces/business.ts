export interface Business{
  name: string;
  address: string;
  mobile: string;
  type: string;
  users?: User[];
}

export interface User{
  id?: number;
  name: string;
  role: string;
  email: string;
  mobile: string;
  businessId: number;
  password?: string;
}
