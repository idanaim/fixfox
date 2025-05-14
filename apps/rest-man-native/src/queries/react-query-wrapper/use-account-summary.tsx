import { useQuery } from '@tanstack/react-query';
import { ServerApi } from '../server-api';

export interface AccountSummary {
  accountId: string;
  totalUsers: number;
  totalBusinesses: number;
  openIssuesCount: number;
}

export const useAccountSummary = (accountId: string) => {
  const api = new ServerApi({});
  
  return useQuery<AccountSummary>({
    queryKey: ['accountSummary', accountId],
    queryFn: async () => {
      return api.fetchCall(`accounts/${accountId}/summary`);
    },
    // Only refetch when component mounts or query is invalidated
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!accountId, // Only run query if accountId is provided
  });
}; 