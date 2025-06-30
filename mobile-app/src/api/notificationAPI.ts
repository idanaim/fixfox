import { api } from './api';

export interface NotificationData {
  issueId?: number;
  routeTo?: string;
  routeParams?: any;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  actionRequired?: boolean;
  expiresAt?: string;
}

export interface Notification {
  id: number;
  type: 'issue_assigned' | 'issue_status_changed' | 'issue_comment' | 'issue_escalated' | 'issue_resolved' | 'issue_overdue';
  title: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  channels: ('push' | 'email' | 'sms' | 'in_app')[];
  data: NotificationData;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  business: {
    id: number;
    name: string;
  };
  issue?: {
    id: number;
    status: string;
    problem?: {
      description: string;
    };
  };
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const notificationAPI = {
  /**
   * Get user notifications
   */
  getUserNotifications: async (options: {
    userId?: number;
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    businessId?: number;
  } = {}): Promise<NotificationResponse> => {
    try {
      const params = new URLSearchParams();
      // Default to userId 1 for testing without auth
      if (options.userId) params.append('userId', '22');
      else params.append('userId', '22');
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.unreadOnly) params.append('unreadOnly', 'true');
      if (options.businessId) params.append('businessId', options.businessId.toString());

      const response = await api.get(`/notifications?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: number, userId: number = 1): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`, {
        userId,
      });
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (businessId?: number, userId: number = 1): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.put('/notifications/mark-all-read', {
        userId,
        businessId,
      });
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Create test notification
   */
  createTestNotification: async (businessId: number = 1, userId: number = 1): Promise<{
    success: boolean;
    message: string;
    notification: Notification;
  }> => {
    try {
      const response = await api.post('/notifications/test', {
        userId,
        businessId,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating test notification:', error);
      throw error;
    }
  },
};
