import { useQuery } from '@tanstack/react-query';
import { useIssueStats } from './useIssues';
import { useDashboardStore } from '../store/dashboard.store';
import useAuthStore from '../store/auth.store';

export interface BusinessSummary {
  businessId: number;
  totalUsers: number;
  totalIssues: number;
  openIssues: number;
  activeIssues: number;
  closedIssues: number;
  resolvedToday: number; // We'll calculate this from issue data later
}

export const useBusinessSummary = (businessId: number | null) => {
  const { user } = useAuthStore();
  const { selectedBusiness } = useDashboardStore();
  
  // Get issue statistics for the business
  const { 
    data: issueStats, 
    isLoading: issueStatsLoading, 
    error: issueStatsError 
  } = useIssueStats(businessId || 0, { enabled: !!businessId });

  // Get employee count from selected business (if it matches the requested businessId)
  const shouldUseSelectedBusiness = businessId && selectedBusiness && businessId === selectedBusiness.id;
  const employeeCount = shouldUseSelectedBusiness ? selectedBusiness?.employees?.length || 0 : 0;

  // Calculate business-specific data
  const businessSummary: BusinessSummary | null = businessId && issueStats ? {
    businessId,
    totalUsers: employeeCount,
    totalIssues: issueStats.total || 0,
    openIssues: issueStats.open || 0,
    activeIssues: issueStats.activeIssues || 0,
    closedIssues: issueStats.closed || 0,
    resolvedToday: 0, // TODO: Calculate from issue data with date filtering
  } : null;

  return {
    data: businessSummary,
    isLoading: issueStatsLoading,
    error: issueStatsError,
    issueStats,
  };
}; 