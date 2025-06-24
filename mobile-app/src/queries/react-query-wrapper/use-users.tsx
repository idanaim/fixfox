import { useMutation, useQuery } from '@tanstack/react-query';
import { User } from '../../interfaces/business';
import { useContext } from 'react';
import { FixFoxProvidersContext } from '../../store/fixfox-provider';

export const useUsersByAdmin = (accountId?: string) => {
  const { serverApi } = useContext(FixFoxProvidersContext);
  return useQuery({
    queryKey: ['usersByAdmin', accountId],
    queryFn: () => serverApi.fetchCall(`user/all/${accountId}`),
    enabled: !!accountId,
  });
};

export const useUserById = (userId?: number) => {
  const { serverApi } = useContext(FixFoxProvidersContext);
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => serverApi.fetchCall(`user/${userId}`),
    enabled: !!userId,
  });
};

export const useUpdateUser = (userId: number) => {
  const { serverApi } = useContext(FixFoxProvidersContext);
  return useMutation({
    mutationFn: (user) => serverApi.postCall(`user/${userId}`, user, 'PUT'),
    onSuccess: (data) => {
      // queryClient.invalidateQueries(['usersByAdmin', userId]);
      console.log('User updated successfully:', data);
    },
    onError: (error) => {
      console.error('Error updating User:', error.message);
    },
  });
};
export const useAddUser = (accountId: string) => {
  const { serverApi } = useContext(FixFoxProvidersContext);
  return useMutation({
    mutationFn: (data: User) => serverApi.postCall('user/' + accountId, data),
    onSuccess: (data) => {
      console.log('Employee added successfully:', data);
      // queryClient.invalidateQueries(['usersByAdmin', adminId]);
    },
    onError: (error) => {
      console.error('Error adding Employee:', error.message);
    },
  });
};
