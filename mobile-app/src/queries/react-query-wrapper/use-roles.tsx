import { useQuery } from '@tanstack/react-query';
import { ServerApi } from '../server-api';

export interface Role {
  id: string;
  name: string;
  description: string;
}

export const useRoles = () => {
  const api = new ServerApi({});
  
  return useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      return api.fetchCall('roles');
    },
  });
}; 