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
  adminId?: number;
  password?: string;
  accountId: string;
  department?: string;
  departments?: string[];
  positionTitle?: string;
}

export const InitUser: User = {
  name: '',
  role: '',
  email: '',
  mobile: '',
  businessId: 0,
  adminId: 0,
  password: '',
  accountId: '',
  department: '',
  departments: [],
  positionTitle: ''
}
