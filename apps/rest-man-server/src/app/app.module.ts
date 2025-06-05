import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from '../admin/admin.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AiSolutionsModule } from '../ai-solutions/AiSolutions.module';
import { ChatModule } from '../ai-solutions/chat.module';
import { EquipmentModule } from './equipment.module';
import { TechnicianModule } from '../technician/technician.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'fixfox_user',
      password: '12345',
      database: 'fixfox_db',
      autoLoadEntities: true,
      synchronize: false, // Disable auto-sync
      migrations: ['dist/migrations/*.js'], // Path to migrations
      migrationsRun: true, // Run migrations on startup
    }),
    AuthModule,
    AiSolutionsModule,
    ChatModule,
    TechnicianModule,
    AdminModule,
    EquipmentModule,
    ConfigModule,
  ],
  exports: [ ],
  controllers: [
  ],

  providers: [],
})
export class AppModule {}
