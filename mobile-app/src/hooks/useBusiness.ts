import { create } from 'zustand';

interface Business {
  id: number;
  name: string;
  logo?: string;
}

interface BusinessState {
  currentBusiness: Business | null;
  setCurrentBusiness: (business: Business | null) => void;
}

// Mock business for testing
const mockBusiness: Business = {
  id: 1,
  name: 'Test Restaurant',
};

export const useBusiness = create<BusinessState>((set) => ({
  currentBusiness: mockBusiness, // Set mock business as default for testing
  setCurrentBusiness: (business) => set({ currentBusiness: business }),
})); 