import { Module } from '@nestjs/common';
import { SimpleNotificationController } from './controllers/simple-notification.controller';

@Module({
  controllers: [SimpleNotificationController],
  providers: [],
  exports: [],
})
export class SimpleNotificationModule {} 