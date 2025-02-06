import { Schema } from "mongoose";

export const TicketSchema = new Schema({
  _id: Number,
  title: String,
  assignee: String,
  reporter: String,
  status: String,
  created: Date,
  updated: Date,
  priority: String,
  description: String,
  equipmentDetails: String
});
