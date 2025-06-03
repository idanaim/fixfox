export class OnboardingDto {
  account: {
    name: string;
  };
  // Admin user data
  admin: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    mobile: string;
  };

  // Business data
  business: {
    name: string;
    type: string;
    address: string;
    phone: string;
  };
  // Team members
  teamMembers: Array<{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    mobile: string;
  }>;
}
