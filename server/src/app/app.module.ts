import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>(
          'DB_HOST',
          'fixfoxdb.cb8aywmkgppq.us-west-2.rds.amazonaws.com'
        ),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'idanaim'),
        password: configService.get<string>('DB_PASSWORD', 'In16051982'),
        database: configService.get<string>('DB_DATABASE', 'fixfoxdb'),
        autoLoadEntities: true,
        synchronize: false, // Disable auto-sync
        migrations: ['dist/migrations/*.js'], // Path to migrations
        migrationsRun: true, // Run migrations on startup
        ssl: {
          rejectUnauthorized: false, // Accept AWS RDS's default cert
        },
      }),
      inject: [ConfigService],
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
  exports: [],
  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}
