// hooks/useRegisterEmployee.js


import { useMutation } from '@tanstack/react-query';
const registerEmployee = async (body:any) => {
  const response = await fetch(`http://localhost:3000/api/user/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  });
  if (response.ok) {
    return  await response.json();
  } else {
    console.error('Failed to update maintenance call status');
  }
};
const useRegisterEmployee = () => {
  return useMutation({
    mutationFn:(admin )=>registerEmployee(admin),
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

export default useRegisterEmployee;
