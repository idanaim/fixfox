import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetBusinesses } from '../queries/react-query-wrapper/use-get-business';
import authStore from '../store/auth.store';
import { useDashboardStore } from '../store/dashboard.store';

export const useBusinesses = () => {
  const { user } = authStore();
  const queryClient = useQueryClient();
  const { selectedBusiness, setSelectedBusiness } = useDashboardStore();

  const {data: businesses, isLoading } = useGetBusinesses(user?.accountId);

  // Auto-select first business if none selected
  useEffect(() => {
    if (businesses && businesses.length > 0 && !selectedBusiness) {
      setSelectedBusiness(businesses[0]);
    }
  }, [businesses, selectedBusiness, setSelectedBusiness]);

  const handleSetSelectedBusiness = (business: any | null) => {
    console.log('useBusinesses - Business changing from', selectedBusiness?.id, 'to', business?.id);
    setSelectedBusiness(business);
    
    // Invalidate business-related queries when business changes
    queryClient.invalidateQueries({ queryKey: ['issueStats'] });
    queryClient.invalidateQueries({ queryKey: ['businessIssues'] });
    queryClient.invalidateQueries({ queryKey: ['issueManagement'] });
    queryClient.invalidateQueries({ queryKey: ['appliances'] });
  };

  return {
    businesses: businesses || [],
    selectedBusiness,
    setSelectedBusiness: handleSetSelectedBusiness,
    isLoading,
  };
};
