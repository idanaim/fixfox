import { Controller, Get, Post, Put, Param, Query, Body } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { PushNotificationService } from '../services/push-notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  @Get()
  async getUserNotifications(
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('businessId') businessId?: string,
  ) {
    // Use userId from query parameter or default to 1 for testing
    const userIdNumber = userId ? parseInt(userId) : 1;
    
    return this.notificationService.getUserNotifications(userIdNumber, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      unreadOnly: unreadOnly === 'true',
      businessId: businessId ? parseInt(businessId) : undefined,
    });
  }

  @Put(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @Body('userId') userId: number,
  ) {
    const notificationId = parseInt(id);
    const userIdNumber = userId || 1; // Default to 1 for testing
    
    return this.notificationService.markAsRead(notificationId, userIdNumber);
  }

  @Put('mark-all-read')
  async markAllAsRead(
    @Body('userId') userId: number,
    @Body('businessId') businessId?: number,
  ) {
    const userIdNumber = userId || 1; // Default to 1 for testing
    
    return this.notificationService.markAllAsRead(userIdNumber, businessId);
  }

  @Post('test')
  async createTestNotification(
    @Body('userId') userId: number,
    @Body('businessId') businessId: number,
  ) {
    const userIdNumber = userId || 1; // Default to 1 for testing
    const businessIdNumber = businessId || 1; // Default to 1 for testing

    if (!businessIdNumber) {
      return {
        success: false,
        message: 'Business ID is required',
      };
    }

    try {
      const notification = await this.notificationService.createTestNotification(userIdNumber, businessIdNumber);
      
      // Send push notification
      await this.pushNotificationService.sendPushNotification({
        userId: userIdNumber,
        title: notification.title,
        message: notification.message,
        data: {
          notificationId: notification.id,
          type: notification.type,
          ...(notification.data || {}),
        },
        sound: 'default',
        priority: 'high',
      });

      return {
        success: true,
        message: 'Test notification created and push notification sent! 🔔📱',
        notification,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create test notification',
        error: error.message,
      };
    }
  }

  @Post('test-simple')
  async createSimpleTestNotification() {
    return {
      success: true,
      message: 'Notification endpoints are working! ✅ (No auth required)',
      timestamp: new Date().toISOString(),
      endpoints: {
        getUserNotifications: 'GET /notifications?userId=1',
        markAsRead: 'PUT /notifications/:id/read (body: {userId: 1})',
        markAllAsRead: 'PUT /notifications/mark-all-read (body: {userId: 1})',
        createTestNotification: 'POST /notifications/test (body: {userId: 1, businessId: 1})',
        registerPushToken: 'POST /notifications/push/register (body: {userId: 1, token: "...", platform: "android"})',
        testPushNotification: 'POST /notifications/push/test (body: {userId: 1})',
      }
    };
  }

  @Post('test-mock')
  async createMockNotification() {
    // Return a mock notification for testing UI without database
    const mockNotification = {
      id: 999,
      type: 'issue_assigned',
      title: 'Test Issue Assigned',
      message: 'A test issue has been assigned to you for testing purposes.',
      data: {
        issueId: 123,
        businessId: 1,
        routeTo: 'IssueDetails',
        routeParams: { issueId: 123 },
        priority: 'high',
      },
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Mock notification created for UI testing! 🧪',
      notification: mockNotification,
    };
  }


} 