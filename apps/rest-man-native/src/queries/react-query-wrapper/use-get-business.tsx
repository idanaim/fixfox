// Fetch businesses
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchCall, postCall } from '../server-api';

export const useGetBusinesses = (adminId: number) => {
  return useQuery({
    queryKey: ['businesses', adminId],
    queryFn: () => fetchCall(`businesses/${adminId}`),
    enabled: !!adminId,
  });
};
export const useUpdateBusinesses = (businessId: number) => {
  return useMutation({
    mutationFn: (business) =>
      postCall(`businesses/${businessId}`, business, 'PUT'),
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
  return useMutation({
    mutationFn: (businessId: number) =>
      postCall(`businesses/${businessId}`, 'DELETE'),
  });
};

export const useCreateBusiness = () => {
  return useMutation({
    mutationFn: (business) => postCall('businesses', business),
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
  return useQuery({
    queryKey: ['employees', businessId],
    queryFn: () => fetchCall(`?businessId=${businessId}`),
    enabled: !!businessId,
  });
};

export const useAddEmployeesToBusiness = () => {
  return useMutation({
    mutationFn: (employees) => postCall('employees', employees),
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
  return useMutation({
    mutationFn: (employee) => postCall('user-business', employee),
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
