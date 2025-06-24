import { useMutation } from '@tanstack/react-query';
import { useContext } from 'react';
import { FixFoxProvidersContext } from '../../store/fixfox-provider';

// Interface that matches our backend OnboardingDto structure
export interface OnboardingData {
  account: {
    name: string;
  };
  admin: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    mobile: string;
  };
  business: {
    name: string;
    type: string;
    address?: string;
    phone: string;
  };
  teamMembers?: Array<{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    mobile: string;
  }>;
}

// Response interface
export interface OnboardingResponse {
  success: boolean;
  token: string;
  accountId: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  businessId: number;
}

/**
 * Hook to handle the onboarding process
 * This sends all onboarding data in a single request to create account, admin, business and team members
 */
export const useOnboarding = () => {
  const { serverApi } = useContext(FixFoxProvidersContext);

  return useMutation<OnboardingResponse, Error, OnboardingData>({
    mutationFn: async (onboardingData: OnboardingData) => {
      const response = await serverApi.postCall('accounts/onboarding', onboardingData);
      return response.data || response;
    }
  });
};
