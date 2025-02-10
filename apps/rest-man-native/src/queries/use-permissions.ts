// src/hooks/usePermissions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCall, postCall } from './server-api';

export const usePermissions = (userId: number) => {
  const queryClient = useQueryClient();

  // Fetch permissions
  const permissionsQuery = useQuery({
    queryKey: ['permissions', userId],
    queryFn: async () => {
      const data = await fetchCall(`permissions/${userId}`);
      return {
        ...data,
        userId,
      }
      return data;
    },
    enabled: !!userId, // Only fetch when userId exists
  });

  // Update permissions
  const updatePermissions = useMutation({
    mutationFn: async (updatedPermissions: any) => {
      debugger
      const { data } = await postCall(
        `permissions/${userId}`,
        updatedPermissions,
        'PUT'
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['permissions', userId]);
    },
  });

  return {
    permissions: permissionsQuery.data,
    isLoading: permissionsQuery.isLoading,
    isError: permissionsQuery.isError,
    updatePermissions,
  };
};
