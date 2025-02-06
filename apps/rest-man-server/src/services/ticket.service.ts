// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Ticket } from '../entities/ticket.entity';
//
// @Injectable()
// export class TicketService {
//   constructor(
//     @InjectModel('Ticket') private Ticket: Model<Ticket>
//   ) {
//   }
//
//   create(ticket: Partial<Ticket>): Promise<Ticket> {
//     const newTicket = new this.Ticket(ticket);
//     return newTicket.save();
//   }
//
//   findAll(): Promise<Ticket[]> {
//     return this.Ticket.find().exec();
//   }
//
//   async updateStatus(id: string, status: string): Promise<Ticket> {
//     return this.Ticket.findByIdAndUpdate(id, { status }, { new: true }).exec();
//   }
// }
