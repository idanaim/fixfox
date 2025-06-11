import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from '../admin/admin.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AiSolutionsModule } from '../ai-solutions/AiSolutions.module';
import { ChatModule } from '../ai-solutions/chat.module';
import { EquipmentModule } from './equipment.module';
import { TechnicianModule } from '../technician/technician.module';
import { StorageModule } from '../storage/storage.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'fixfoxdb.cb8aywmkgppq.us-west-2.rds.amazonaws.com',
      port: 5432,
      username: 'idanaim',
      password: 'In16051982',
      database: 'fixfoxdb',
      autoLoadEntities: true,
      synchronize: false, // Disable auto-sync
      migrations: ['dist/migrations/*.js'], // Path to migrations
      migrationsRun: true, // Run migrations on startup
      ssl: {
        rejectUnauthorized: false, // Accept AWS RDS's default cert
      },
    }),
    AuthModule,
    AiSolutionsModule,
    ChatModule,
    TechnicianModule,
    AdminModule,
    EquipmentModule,
    StorageModule,
    ConfigModule,
  ],
  exports: [ ],
  controllers: [
    AppController
  ],

  providers: [AppService],
})
export class AppModule {}
