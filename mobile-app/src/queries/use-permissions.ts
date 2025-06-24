// src/hooks/usePermissions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ServerApi } from './server-api';
import { useContext } from 'react';
import { FixFoxProvidersContext } from '../store/fixfox-provider';

export const usePermissions = (userId: number) => {
  const queryClient = useQueryClient();
  const { serverApi } = useContext(FixFoxProvidersContext);
  // Fetch permissions
  const permissionsQuery = useQuery({
    queryKey: ['permissions', userId],
    queryFn: async () => {
      const data = await serverApi.fetchCall(`user/${userId}/permissions`);
      return {
        ...data,
        userId,
      }
    },
    enabled: !!userId, // Only fetch when userId exists
  });

  // Update permissions
  const updatePermissions = useMutation({

    mutationFn: async (updatedPermissions: any) => {
      const { data } = await serverApi.postCall(
        `permissions/${userId}`,
        updatedPermissions,
        'PUT'
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions', userId] });
    },
  });

  return {
    permissions: permissionsQuery.data,
    isLoading: permissionsQuery.isLoading,
    isError: permissionsQuery.isError,
    updatePermissions,
  };
};
