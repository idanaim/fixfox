import { useMutation } from '@tanstack/react-query';
import { FixFoxProvidersContext } from '../store/fixfox-provider';
import { useContext } from 'react';

export const useAuth=() =>{
  const { serverApi } = useContext(FixFoxProvidersContext);
  return useMutation({
    mutationFn: async (userlogin) => {
      const { data } = await serverApi.postCall(
        'auth/login',
        userlogin,
        'POST'
      );
      return data;
    },
    onSuccess: () => {
      console.log('Login Success');
    },
  });
}
