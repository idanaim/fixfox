import { useQuery } from '@tanstack/react-query';
import { Technician } from '../interfaces/Technician';
import { useContext } from 'react';
import { FixFoxProvidersContext } from '../../../store/fixfox-provider';

export function useTechnicians() {
  const { serverApi } = useContext(FixFoxProvidersContext);
  return useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      return await serverApi.fetchCall('technicians');
    },
  });
}

export function useTechnicianById(id: string) {
  const { serverApi } = useContext(FixFoxProvidersContext);
  return useQuery<Technician>({
    queryKey: ['technicians', id],
    queryFn: async () => {
     return await serverApi.fetchCall(`technicians/${id}`);
    },
  });
}
