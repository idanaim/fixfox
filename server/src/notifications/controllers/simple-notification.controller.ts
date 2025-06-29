import { Controller, Post } from '@nestjs/common';

@Controller('simple-notifications')
export class SimpleNotificationController {
  @Post('test')
  async test() {
    return {
      success: true,
      message: 'Simple notification test working! ✅',
      timestamp: new Date().toISOString()
    };
  }
} 