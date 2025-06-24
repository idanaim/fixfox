export class WizardDto {
  admin: {
    name: string;
    email: string;
    password: string;
    mobile: string;
  };
  businesses: {
    name: string;
    address: string;
    mobile: string;
    type: string;
  }[];
  users: {
    name: string;
    email: string;
    mobile: string;
  }[];
}
