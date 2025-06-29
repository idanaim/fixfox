import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationService } from './services/notification.service';
import { PushNotificationService } from './services/push-notification.service';
import { NotificationController } from './controllers/notification.controller';
import { PushNotificationController } from './controllers/push-notification.controller';
import { User } from '../admin/entities/user.entity';
import { Issue } from '../ai-solutions/entities/issue.entity';
import { Business } from '../admin/entities/business.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      User,
      Issue,
      Business,
    ]),
  ],
  controllers: [NotificationController, PushNotificationController],
  providers: [NotificationService, PushNotificationService],
  exports: [NotificationService, PushNotificationService],
})
export class NotificationModule {} 