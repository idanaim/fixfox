// import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
// import { Ticket } from '../entities/ticket.entity';
// import { TicketService } from '../services/ticket.service';
//
//
// @Controller('rest_man_ticket')
// export class TicketController {
//   constructor(private ticketService: TicketService) {}
//
//   @Get()
//   async getAllTickets() {
//     return this.ticketService.findAll();
//   }
//
//   @Post()
//   async createTicket(@Body() ticket: Partial<Ticket>) {
//     return this.ticketService.create(ticket);
//   }
//
//   @Patch(':id')
//   async updateTicketStatus(@Param('id') id: string, @Body('status') status: string) {
//     return this.ticketService.updateStatus(id, status);
//   }
// }
