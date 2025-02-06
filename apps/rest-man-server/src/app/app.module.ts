import { Module } from '@nestjs/common';
// import { TicketController } from '../controllers/ticket.controller';
// import { TicketService } from '../services/ticket.service';
// import { TicketSchema } from '../schemas/ticket.schema';
//
// import { BusinessController } from '../controllers/business.controller';
// import { EmployeeController } from '../controllers/employee.controller';
// import { BusinessService } from '../services/business.service';
// import { EmployeeService } from '../services/employee.service';
// import { Business, BusinessSchema } from '../schemas/business.schema';
// import { EmployeeUser, EmployeeUserSchema } from '../schemas/employee.schema';
import { AdminModule } from '../admin/admin.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [

    TypeOrmModule.forRoot({
      type: 'postgres', // Database type
      host: 'localhost', // Database host
      port: 5432, // PostgreSQL default port
      username: 'fixfox_user', // Your PostgreSQL username
      password: '12345', // Your PostgreSQL password
      database: 'fixfox_db', // Name of your database
      autoLoadEntities: true, // Automatically load entities
      synchronize: true, // Automatically sync tables with entities (don't use in production)
    }),
AdminModule
  ],
  exports: [ ],
  controllers: [
  ],

  providers: [],
})
export class AppModule {}
