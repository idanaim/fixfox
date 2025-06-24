import { useState, useEffect } from 'react';
import { useGetBusinesses } from '../queries/react-query-wrapper/use-get-business';
import authStore from '../store/auth.store';

interface Business {
  id: number;
  name: string;
}

export const useBusinesses = () => {
  const { user } = authStore();
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

const {data: businesses, isLoading } = useGetBusinesses(user?.accountId);

  useEffect(() => {
    if (businesses && businesses.length > 0 && !selectedBusiness) {
      setSelectedBusiness(businesses[0]);
    }
  }, [businesses]);

  return {
    businesses: businesses || [],
    selectedBusiness,
    setSelectedBusiness,
    isLoading,
  };
};
