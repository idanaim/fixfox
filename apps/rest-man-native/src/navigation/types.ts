export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Chat: {
    userId: number;
    businessId: number;
    ticketId?: number;
    equipmentId?: number;
  };
}; 