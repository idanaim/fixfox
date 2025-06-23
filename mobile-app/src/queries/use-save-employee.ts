// hooks/useRegisterEmployee.js


import { useMutation } from '@tanstack/react-query';
import { useContext } from 'react';
import { FixFoxProvidersContext } from '../store/fixfox-provider';
const registerEmployee = async (body:any) => {
  const { serverApi } = useContext(FixFoxProvidersContext);
  const response = await serverApi.postCall(`hemployees/associate`, {
    method: 'POST',
 body
  });
  if (response.ok) {
    return  await response.json();
  } else {
    console.error('Failed to update maintenance call status');
  }
};
const useSaveEmployee = () => {
  return useMutation({
    mutationFn:(employee:any )=>registerEmployee(employee),
    onSuccess: (data) => {
      console.log('Employee registered successfully:', data);
      // Handle success, e.g., show a success message or redirect
    },
    onError: (error) => {
      console.error('Error registering employee:', error.message);
      // Handle error, e.g., show an error notification
    },
  });
};

export default useSaveEmployee;


