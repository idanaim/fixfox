// Fetch businesses
import { useMutation, useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { FixFoxProvidersContext } from '../../store/fixfox-provider';

export const useGetBusinesses = (accountId?: string) => {
  const { serverApi } = useContext(FixFoxProvidersContext);
  return useQuery({
    queryKey: ['businesses', accountId],
    queryFn: () => serverApi.fetchCall(`businesses/${accountId}`),
    enabled: !!accountId,
  });
};
export const useUpdateBusinesses = (businessId: number) => {
  const { serverApi } = useContext(FixFoxProvidersContext);
  return useMutation({
    mutationFn: (business) =>
      serverApi.postCall(`businesses/${businessId}`, business, 'PUT'),
    onSuccess: (data) => {
      console.log('Business updated successfully:', data);
      // Handle success, e.g., show a success message or redirect
    },
    onError: (error) => {
      console.error('Error updated Business:', error.message);
      // Handle error, e.g., show an error notification
    },
  });
};

export const useDeleteBusiness = () => {
  const { serverApi } = useContext(FixFoxProvidersContext);
  return useMutation({
    mutationFn: (businessId: number) =>
      serverApi.postCall(`businesses/${businessId}`, 'DELETE'),
  });
};

export const useCreateBusiness = () => {
  const { serverApi } = useContext(FixFoxProvidersContext);
  return useMutation({
    mutationFn: (business) => serverApi.postCall('businesses', business),
    onSuccess: (data) => {
      console.log('Business created successfully:', data);
      // Handle success, e.g., show a success message or redirect
    },
    onError: (error) => {
      console.error('Error creating Business:', error.message);
      // Handle error, e.g., show an error notification
    },
  });
};

// Fetch employees for a specific business
export const useGetBusinessEmployees = (businessId: string | number) => {
  const { serverApi } = useContext(FixFoxProvidersContext);
  return useQuery({
    queryKey: ['employees', businessId],
    queryFn: () => serverApi.fetchCall(`?businessId=${businessId}`),
    enabled: !!businessId,
  });
};

export const useAddEmployeesToBusiness = () => {
  const { serverApi } = useContext(FixFoxProvidersContext);
  return useMutation({
    mutationFn: (employees) => serverApi.postCall('employees/associate', employees),
    onSuccess: (data) => {
      console.log('Employees added successfully:', data);
      // Handle success, e.g., show a success message or redirect
    },
    onError: (error) => {
      console.error('Error adding Employees:', error.message);
      // Handle error, e.g., show an error notification
    },
  });
}

export const useAddEmployeeToBusiness = () => {
  const { serverApi } = useContext(FixFoxProvidersContext);
  return useMutation({
    mutationFn: (employee) => serverApi.postCall('user-business', employee),
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
