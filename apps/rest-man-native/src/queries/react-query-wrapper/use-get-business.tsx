// Fetch businesses
import { useQuery } from '@tanstack/react-query';

async function fetchCall(controller: string) {
  const response = await fetch(`http://localhost:3000/api/${controller}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (response.ok) {
    return await response.json();
  } else {
    console.error('Failed to update ${controller} call status');
  }

}

export const useBusinesses = (adminId) => {

  return useQuery({
    queryKey: ['businesses'],
    queryFn: () => fetchCall(`businesses/${adminId}`),
  });
};

// Fetch employees for a specific business
export const useEmployees = (businessId: string | number) => {
  return useQuery({
    queryKey: ['employees', businessId],
    queryFn: () => fetchCall(`?businessId=${businessId}`),
    enabled:!!businessId

  });
};

export const useUsersByAdmin = (adminId: number) => {
  return useQuery({
    queryKey:['usersByAdmin',adminId],
    queryFn: () => fetchCall(`user-business/users/${adminId}`),
    enabled: !!adminId
  });
};

export const useUserById = (userId:number) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchCall(`user/${userId}`),
    enabled: !!userId
  });
};
