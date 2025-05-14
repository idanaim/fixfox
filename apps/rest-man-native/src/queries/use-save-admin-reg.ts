// hooks/useRegisterEmployee.js


import { useMutation } from '@tanstack/react-query';
const registerEmployee = async (body:any) => {

  const response = await fetch(`http://localhost:3000/api/user/admin/signUp`, {
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

const x = {
  "admin": {
    "name": "Doron Hongisberg",
    "email": "doron@gmail.com",
    "password": "12345",
    "mobile": "05464687"
  },
  "businesses": [
    {
      "name": "85/15",
      "address": "Gordon 15 TLV",
      "mobile": "35464684",
      "type": "Restourant  "
    },
    {
      "name": "Dr Shakshka",
      "address": "Maskit 15 Yafo",
      "mobile": "64984987",
      "type": "Resturant "
    }
  ],
  "users": [
    {
      "name": "Idan Naim",
      "email": "idan@gmail.com",
      "password": "defaultPassword",
      "mobile": "65464984"
    },
    {
      "name": "Hila Naim",
      "email": "hila@gmail.com",
      "password": "defaultPassword",
      "mobile": "654984987"
    },
    {
      "name": "Noam Naim",
      "email": "noam@gmail.com",
      "password": "defaultPassword",
      "mobile": "+65494987"
    },
    {
      "name": "Mia Naim",
      "email": "mia@gmail.com",
      "password": "defaultPassword",
      "mobile": "+65494987"
    },
    {
      "name": "Dor Naim",
      "email": "dor@gmail.com",
      "password": "defaultPassword",
      "mobile": "+65494987"
    }
  ]
}
const useRegisterEmployee = () => {
  return useMutation({
    mutationFn:(admin )=>registerEmployee(x),
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
