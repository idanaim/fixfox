import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export const useUpdateUser = (userId:number) => {
  // const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user) => postCall(`user/${userId}`, user, 'PUT'),
    onSuccess: (data) => {
      // queryClient.invalidateQueries(['usersByAdmin', userId]);
      console.log('User updated successfully:', data);
    },
    onError: (error) => {
      console.error('Error updating User:', error.message);
    },
  });
}
export const useAddUser = (adminId: number) => {
  // const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: User) => postCall('user/' + adminId, data),
    onSuccess: (data) => {
      console.log('Employee added successfully:', data);
      // queryClient.invalidateQueries(['usersByAdmin', adminId]);
    },
    onError: (error) => {
      console.error('Error adding Employee:', error.message);
    },
  });
};
