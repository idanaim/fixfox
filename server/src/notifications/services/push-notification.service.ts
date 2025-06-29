import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../admin/entities/user.entity';

export interface PushNotificationData {
  userId: number;
  title: string;
  message: string;
  data?: any;
  sound?: string;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
}

export interface UserPushToken {
  id: number;
  userId: number;
  token: string;
  platform: 'ios' | 'android' | 'web';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: any;
  sound?: string;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
}

@Injectable()
export class PushNotificationService {
  private readonly EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
  private pushTokens: Map<number, UserPushToken[]> = new Map(); // In-memory storage for demo

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async sendPushNotification(data: PushNotificationData): Promise<void> {
    try {
      console.log('📱 Sending push notification:', {
        userId: data.userId,
        title: data.title,
        message: data.message,
        data: data.data,
        timestamp: new Date().toISOString(),
      });

      // Get user's push tokens
      const userTokens = this.pushTokens.get(data.userId) || [];
      const activeTokens = userTokens.filter(token => token.isActive);

      if (activeTokens.length === 0) {
        console.log(`⚠️ No active push tokens found for user ${data.userId}`);
        return;
      }

      // Send to each active token
      const pushPromises = activeTokens.map(tokenData => 
        this.sendExpoNotification({
          to: tokenData.token,
          title: data.title,
          body: data.message,
          data: data.data,
          sound: data.sound || 'default',
          badge: data.badge,
          priority: data.priority || 'high',
          channelId: 'default', // For Android
        })
      );

      const results = await Promise.allSettled(pushPromises);
      
      // Log results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          console.log(`✅ Push notification sent to token ${index + 1}`);
        } else {
          console.error(`❌ Failed to send to token ${index + 1}:`, result.reason);
        }
      });

    } catch (error) {
      console.error('Failed to send push notification:', error);
      throw error;
    }
  }

  private async sendExpoNotification(message: ExpoPushMessage): Promise<any> {
    try {
      // Validate Expo push token format
      if (!this.isValidExpoPushToken(message.to)) {
        throw new Error(`Invalid Expo push token: ${message.to}`);
      }

      const response = await fetch(this.EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.data && result.data.status === 'error') {
        throw new Error(`Expo push error: ${result.data.message}`);
      }

      return result;
    } catch (error) {
      console.error('Expo push notification error:', error);
      throw error;
    }
  }

  private isValidExpoPushToken(token: string): boolean {
    // Expo push tokens start with ExponentPushToken[...] or ExpoPushToken[...]
    return /^Expo(nent)?PushToken\[.+\]$/.test(token);
  }

  async registerPushToken(
    userId: number, 
    token: string, 
    platform: 'ios' | 'android' | 'web'
  ): Promise<void> {
    try {
      if (!this.isValidExpoPushToken(token)) {
        throw new Error('Invalid Expo push token format');
      }

      // Get existing tokens for user
      const userTokens = this.pushTokens.get(userId) || [];
      
      // Check if token already exists
      const existingTokenIndex = userTokens.findIndex(t => t.token === token);
      
      if (existingTokenIndex >= 0) {
        // Update existing token
        userTokens[existingTokenIndex] = {
          ...userTokens[existingTokenIndex],
          isActive: true,
          updatedAt: new Date(),
        };
      } else {
        // Add new token
        const newToken: UserPushToken = {
          id: Date.now(), // Simple ID generation for demo
          userId,
          token,
          platform,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        userTokens.push(newToken);
      }

      this.pushTokens.set(userId, userTokens);

      console.log(`📝 Registered push token for user ${userId}:`, {
        token: token.substring(0, 30) + '...',
        platform,
        totalTokens: userTokens.length,
      });
    } catch (error) {
      console.error('Failed to register push token:', error);
      throw error;
    }
  }

  async removePushToken(userId: number, token: string): Promise<void> {
    try {
      const userTokens = this.pushTokens.get(userId) || [];
      const updatedTokens = userTokens.filter(t => t.token !== token);
      
      if (updatedTokens.length < userTokens.length) {
        this.pushTokens.set(userId, updatedTokens);
        console.log(`🗑️ Removed push token for user ${userId}`);
      } else {
        console.log(`⚠️ Push token not found for user ${userId}`);
      }
    } catch (error) {
      console.error('Failed to remove push token:', error);
      throw error;
    }
  }

  async getUserPushTokens(userId: number): Promise<UserPushToken[]> {
    return this.pushTokens.get(userId) || [];
  }

  async testPushNotification(userId: number): Promise<void> {
    await this.sendPushNotification({
      userId,
      title: '🔔 Test Notification',
      message: 'This is a test push notification from FixFox!',
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
      sound: 'default',
      priority: 'high',
    });
  }
} 