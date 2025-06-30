import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { PushNotificationService } from '../services/push-notification.service';

@Controller('notifications/push')
export class PushNotificationController {
  constructor(
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  @Post('register')
  async registerPushToken(
    @Body('userId') userId: number,
    @Body('token') token: string,
    @Body('platform') platform: 'ios' | 'android' | 'web',
  ) {
    try {
      const userIdNumber = userId || 22; // Default to 22 for testing
      
      if (!token) {
        return {
          success: false,
          message: 'Push token is required',
        };
      }

      await this.pushNotificationService.registerPushToken(userIdNumber, token, platform || 'android');

      return {
        success: true,
        message: 'Push token registered successfully! 📱✅',
        userId: userIdNumber,
        platform: platform || 'android',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to register push token',
        error: error.message,
      };
    }
  }

  @Post('test')
  async testPushNotification(
    @Body('userId') userId: number,
  ) {
    try {
      const userIdNumber = userId || 22; // Default to 22 for testing

      await this.pushNotificationService.testPushNotification(userIdNumber);

      return {
        success: true,
        message: 'Test push notification sent! 🔔📱',
        userId: userIdNumber,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send test push notification',
        error: error.message,
      };
    }
  }

  @Get('tokens/:userId')
  async getUserPushTokens(
    @Param('userId') userId: string,
  ) {
    try {
      const userIdNumber = parseInt(userId) || 22;
      const tokens = await this.pushNotificationService.getUserPushTokens(userIdNumber);

      return {
        success: true,
        userId: userIdNumber,
        tokens: tokens.map(token => ({
          id: token.id,
          platform: token.platform,
          isActive: token.isActive,
          createdAt: token.createdAt,
          updatedAt: token.updatedAt,
          // Don't return the full token for security
          tokenPreview: token.token.substring(0, 30) + '...',
        })),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get push tokens',
        error: error.message,
      };
    }
  }

  @Post('remove')
  async removePushToken(
    @Body('userId') userId: number,
    @Body('token') token: string,
  ) {
    try {
      const userIdNumber = userId || 22;
      
      if (!token) {
        return {
          success: false,
          message: 'Push token is required',
        };
      }

      await this.pushNotificationService.removePushToken(userIdNumber, token);

      return {
        success: true,
        message: 'Push token removed successfully! 🗑️',
        userId: userIdNumber,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to remove push token',
        error: error.message,
      };
    }
  }
} 