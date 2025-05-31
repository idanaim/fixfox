export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Onboarding: undefined;
  Chat: {
    userId: number;
    businessId: number;
    ticketId?: number;
    equipmentId?: number;
  };
  Technicians: undefined;
  TechnicianDetails: { id: string };
  IssueDetails: {
    issueId: number;
    businessId: number;
    userId?: number;
  };
}; 