import { useQuery } from '@tanstack/react-query';
import { Equipment } from '../../api/chatAPI';
import { API_BASE_URL } from '../../config';

export const useAppliances = (businessId: number | null) => {
  return useQuery({
    queryKey: ['appliances', businessId],
    queryFn: async (): Promise<Equipment[]> => {
      if (!businessId) {
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/equipment?businessId=${businessId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch appliances: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    },
    enabled: !!businessId, // Only run query if businessId is provided
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false,
  });
}; 