export interface Ticket extends Document {
  _id: string;
  title: string;
  assignee: string;
  reporter: string;
  status: string;
  created: Date;
  updated: Date;
  priority: string;
  description: string;
  equipmentDetails: string;
}
