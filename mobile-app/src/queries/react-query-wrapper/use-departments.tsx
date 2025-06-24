import { useQuery } from '@tanstack/react-query';
import { ServerApi } from '../server-api';

export interface Department {
  value: string;
  label: string;
}

export const useDepartments = () => {
  const api = new ServerApi({});
  
  return useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      return api.fetchCall('departments');
    },
  });
}; 
 