import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchCall, postCall } from '../server-api';
import { User } from '../../interfaces/business';

export const useUsersByAdmin = (adminId: number) => {
  return useQuery({
    queryKey: ['usersByAdmin', adminId],
    queryFn: () => fetchCall(`user/all/${adminId}`),
    enabled: !!adminId,
  });
};

export const useUserById = (userId: number) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchCall(`user/${userId}`),
    enabled: !!userId,
  });
};
export const useAddUser = (adminId: number) => {
  return useMutation({
    mutationFn: (data: User) => postCall('user/' + adminId, data),
    onSuccess: (data) => {
      console.log('Employee added successfully:', data);
      // Handle success, e.g., show a success message or redirect
    },
    onError: (error) => {
      console.error('Error adding Employee:', error.message);
      // Handle error, e.g., show an error notification
    },
  });
};
