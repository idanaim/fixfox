import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issueAPI, Issue, IssueFilters, IssueResponse, IssueStats } from '../api/issueAPI';

// Query keys for React Query
export const issueKeys = {
  all: ['issues'] as const,
  business: (businessId: number) => [...issueKeys.all, 'business', businessId] as const,
  businessWithFilters: (businessId: number, filters: IssueFilters) => 
    [...issueKeys.business(businessId), filters] as const,
  user: (userId: number) => [...issueKeys.all, 'user', userId] as const,
  userWithFilters: (userId: number, filters: IssueFilters) => 
    [...issueKeys.user(userId), filters] as const,
  detail: (id: number) => [...issueKeys.all, 'detail', id] as const,
  stats: (businessId: number) => [...issueKeys.all, 'stats', businessId] as const,
};

/**
 * Hook to fetch issues by business with filtering and pagination
 */
export const useIssuesByBusiness = (
  businessId: number,
  filters: IssueFilters = {},
  options: { enabled?: boolean } = {}
) => {
  return useQuery({
    queryKey: issueKeys.businessWithFilters(businessId, filters),
    queryFn: () => issueAPI.getIssuesByBusiness(businessId, filters),
    enabled: !!businessId && (options.enabled !== false),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch issues by user with filtering and pagination
 */
export const useIssuesByUser = (
  userId: number,
  filters: IssueFilters = {},
  options: { enabled?: boolean } = {}
) => {
  return useQuery({
    queryKey: issueKeys.userWithFilters(userId, filters),
    queryFn: () => issueAPI.getIssuesByUser(userId, filters),
    enabled: !!userId && (options.enabled !== false),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch a single issue by ID
 */
export const useIssueById = (
  issueId: number,
  businessId?: number,
  options: { enabled?: boolean } = {}
) => {
  return useQuery({
    queryKey: issueKeys.detail(issueId),
    queryFn: () => issueAPI.getIssueById(issueId, businessId),
    enabled: !!issueId && (options.enabled !== false),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch issue statistics for a business
 */
export const useIssueStats = (
  businessId: number,
  options: { enabled?: boolean } = {}
) => {
  return useQuery({
    queryKey: issueKeys.stats(businessId),
    queryFn: () => issueAPI.getIssueStats(businessId),
    enabled: !!businessId && (options.enabled !== false),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to create a new issue
 */
export const useCreateIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: issueAPI.createIssue,
    onSuccess: (data, variables) => {
      // Invalidate and refetch issues for the business
      queryClient.invalidateQueries({
        queryKey: issueKeys.business(variables.businessId)
      });
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: issueKeys.stats(variables.businessId)
      });
    },
  });
};

/**
 * Hook to create issue with technician assignment
 */
export const useCreateIssueWithTechnician = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: issueAPI.createIssueWithTechnicianAssignment,
    onSuccess: (data, variables) => {
      // Invalidate and refetch issues for the business
      queryClient.invalidateQueries({
        queryKey: issueKeys.business(variables.businessId)
      });
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: issueKeys.stats(variables.businessId)
      });
    },
  });
};

/**
 * Hook to create resolved issue
 */
export const useCreateResolvedIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: issueAPI.createResolvedIssue,
    onSuccess: (data, variables) => {
      // Invalidate and refetch issues for the business
      queryClient.invalidateQueries({
        queryKey: issueKeys.business(variables.businessId)
      });
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: issueKeys.stats(variables.businessId)
      });
    },
  });
};

/**
 * Hook to update issue status
 */
export const useUpdateIssueStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ issueId, status, businessId, userId }: {
      issueId: number;
      status: string;
      businessId?: number;
      userId?: number;
    }) => issueAPI.updateIssueStatus(issueId, status, businessId, userId),
    onSuccess: (data, variables) => {
      // Update the specific issue in cache
      queryClient.setQueryData(
        issueKeys.detail(variables.issueId),
        data
      );
      
      // Invalidate all issue lists that might contain this issue
      if (variables.businessId) {
        queryClient.invalidateQueries({
          queryKey: issueKeys.business(variables.businessId)
        });
        queryClient.invalidateQueries({
          queryKey: issueKeys.stats(variables.businessId)
        });
      }
      
      if (variables.userId) {
        queryClient.invalidateQueries({
          queryKey: issueKeys.user(variables.userId)
        });
      }
    },
  });
};

/**
 * Hook to assign technician to issue
 */
export const useAssignTechnician = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ issueId, technicianId, businessId }: {
      issueId: number;
      technicianId: number;
      businessId?: number;
    }) => issueAPI.assignTechnician(issueId, technicianId, businessId),
    onSuccess: (data, variables) => {
      // Update the specific issue in cache
      queryClient.setQueryData(
        issueKeys.detail(variables.issueId),
        data
      );
      
      // Invalidate all issue lists that might contain this issue
      if (variables.businessId) {
        queryClient.invalidateQueries({
          queryKey: issueKeys.business(variables.businessId)
        });
        queryClient.invalidateQueries({
          queryKey: issueKeys.stats(variables.businessId)
        });
      }
    },
  });
};

/**
 * Helper hook for real-time issue updates
 */
export const useIssueManagement = (businessId: number, userId?: number) => {
  // Get all issues for the business
  const businessIssues = useIssuesByBusiness(businessId);
  
  // Get user-specific issues if userId provided
  const userIssues = useIssuesByUser(userId!, { businessId }, { enabled: !!userId });
  
  // Get issue statistics
  const issueStats = useIssueStats(businessId);
  
  // Mutation hooks
  const createIssue = useCreateIssue();
  const createIssueWithTechnician = useCreateIssueWithTechnician();
  const createResolvedIssue = useCreateResolvedIssue();
  const updateIssueStatus = useUpdateIssueStatus();
  const assignTechnician = useAssignTechnician();
  
  return {
    // Query results
    businessIssues: businessIssues.data,
    userIssues: userIssues.data,
    issueStats: issueStats.data,
    
    // Loading states
    isLoadingBusinessIssues: businessIssues.isLoading,
    isLoadingUserIssues: userIssues.isLoading,
    isLoadingStats: issueStats.isLoading,
    
    // Error states
    businessIssuesError: businessIssues.error,
    userIssuesError: userIssues.error,
    statsError: issueStats.error,
    
    // Mutations
    createIssue: createIssue.mutate,
    createIssueWithTechnician: createIssueWithTechnician.mutate,
    createResolvedIssue: createResolvedIssue.mutate,
    updateIssueStatus: updateIssueStatus.mutate,
    assignTechnician: assignTechnician.mutate,
    
    // Mutation states
    isCreatingIssue: createIssue.isPending,
    isCreatingIssueWithTechnician: createIssueWithTechnician.isPending,
    isCreatingResolvedIssue: createResolvedIssue.isPending,
    isUpdatingStatus: updateIssueStatus.isPending,
    isAssigningTechnician: assignTechnician.isPending,
    
    // Refresh functions
    refetchBusinessIssues: businessIssues.refetch,
    refetchUserIssues: userIssues.refetch,
    refetchStats: issueStats.refetch,
  };
};

/**
 * Hook to update issue cost
 */
export const useUpdateIssueCost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ issueId, cost, businessId }: {
      issueId: number;
      cost: number;
      businessId?: number;
    }) => issueAPI.updateIssueCost(issueId, cost, businessId),
    onSuccess: (data, variables) => {
      // Update the specific issue in cache
      queryClient.setQueryData(
        issueKeys.detail(variables.issueId),
        data
      );
      
      // Invalidate all issue lists that might contain this issue
      if (variables.businessId) {
        queryClient.invalidateQueries({
          queryKey: issueKeys.business(variables.businessId)
        });
      }
    },
  });
};

/**
 * Hook to update issue treatment
 */
export const useUpdateIssueTreatment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ issueId, treatment, businessId, userId }: {
      issueId: number;
      treatment: string;
      businessId?: number;
      userId?: number;
    }) => issueAPI.updateIssueTreatment(issueId, treatment, businessId, userId),
    onSuccess: (data, variables) => {
      // Update the specific issue in cache
      queryClient.setQueryData(
        issueKeys.detail(variables.issueId),
        data
      );
      
      // Invalidate all issue lists that might contain this issue
      if (variables.businessId) {
        queryClient.invalidateQueries({
          queryKey: issueKeys.business(variables.businessId)
        });
      }
    },
  });
};

/**
 * Hook to close issue
 */
export const useCloseIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ issueId, cost, treatment, businessId, userId }: {
      issueId: number;
      cost?: number;
      treatment?: string;
      businessId?: number;
      userId?: number;
    }) => issueAPI.closeIssue(issueId, cost, treatment, businessId, userId),
    onSuccess: (data, variables) => {
      // Update the specific issue in cache
      queryClient.setQueryData(
        issueKeys.detail(variables.issueId),
        data
      );
      
      // Invalidate all issue lists that might contain this issue
      if (variables.businessId) {
        queryClient.invalidateQueries({
          queryKey: issueKeys.business(variables.businessId)
        });
        queryClient.invalidateQueries({
          queryKey: issueKeys.stats(variables.businessId)
        });
      }
    },
  });
};

/**
 * Hook for comprehensive issue update
 */
export const useUpdateIssueComprehensive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ issueId, ...data }: {
      issueId: number;
      status?: string;
      cost?: number;
      treatment?: string;
      shouldClose?: boolean;
      businessId?: number;
      userId?: number;
    }) => issueAPI.updateIssueComprehensive(issueId, data),
    onSuccess: (data, variables) => {
      // Update the specific issue in cache
      queryClient.setQueryData(
        issueKeys.detail(variables.issueId),
        data
      );
      
      // Invalidate all issue lists that might contain this issue
      if (variables.businessId) {
        queryClient.invalidateQueries({
          queryKey: issueKeys.business(variables.businessId)
        });
        queryClient.invalidateQueries({
          queryKey: issueKeys.stats(variables.businessId)
        });
      }
    },
  });
}; 