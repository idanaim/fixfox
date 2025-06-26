import { create } from 'zustand';

interface Business {
  id: number;
  name: string;
  type: string;
  address?: string;
  mobile?: string;
  employees?: Array<{
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
      department?: string;
      departments?: string[];
      mobile: string;
    };
  }>;
}

interface DashboardState {
  selectedBusiness: Business | null;
  setSelectedBusiness: (business: Business | null) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedBusiness: null,
  setSelectedBusiness: (business: Business | null) => {
    console.log('Dashboard store - Business changing to:', business?.name, business?.id);
    set({ selectedBusiness: business });
  },
}));

export default useDashboardStore; 