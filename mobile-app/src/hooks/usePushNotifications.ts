import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { API_BASE_URL } from '../config';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationData {
  notificationId?: number;
  type?: string;
  routeTo?: string;
  routeParams?: any;
  [key: string]: any;
}

export interface NotificationResponse {
  notification: Notifications.Notification;
  actionIdentifier: string;
}

export const usePushNotifications = (userId: number = 22) => {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        registerTokenWithServer(token);
      }
    });

    // Listen for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notification received:', notification);
      setNotification(notification);
    });

    // Listen for user interactions with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('📱 Notification response:', response);
      handleNotificationResponse(response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [userId]);

  const registerForPushNotificationsAsync = async (): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if we're on a physical device
      if (!Device.isDevice) {
        console.log('⚠️ Push notifications only work on physical devices, using mock token for emulator');
        // For emulator testing, create a mock token
        const mockToken = `ExponentPushToken[emulator-${userId}-${Date.now()}]`;
        console.log('📱 Using mock Expo push token for emulator:', mockToken);
        return mockToken;
      }

      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermissionStatus(finalStatus);

      if (finalStatus !== 'granted') {
        console.log('⚠️ Push notification permission denied');
        setError('Push notification permission denied');
        return null;
      }

      // Get the Expo push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      
      if (!projectId) {
        console.log('⚠️ Project ID not found');
        setError('Project ID not found');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      console.log('📱 Expo push token:', token.data);

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      return token.data;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      setError('Failed to register for push notifications');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const registerTokenWithServer = async (token: string): Promise<void> => {
    try {
      const platform = Platform.OS as 'ios' | 'android';
      
      const response = await fetch(`${API_BASE_URL}/notifications/push/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          token,
          platform,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Push token registered with server:', result.message);
      } else {
        console.error('❌ Failed to register token with server:', result.message);
        setError(result.message);
      }
    } catch (error) {
      console.error('Error registering token with server:', error);
      setError('Failed to register token with server');
    }
  };

  const handleNotificationResponse = (response: NotificationResponse): void => {
    const data = response.notification.request.content.data as PushNotificationData;
    
    console.log('📱 Handling notification response:', {
      actionIdentifier: response.actionIdentifier,
      data,
    });

    // Handle navigation based on notification data
    if (data?.routeTo && data?.routeParams) {
      // This would typically use your navigation system
      console.log(`📱 Should navigate to: ${data.routeTo}`, data.routeParams);
      
      // Example: navigation.navigate(data.routeTo, data.routeParams);
      // You can implement this based on your navigation setup
    }
  };

  const sendTestNotification = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/notifications/push/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Test notification sent:', result.message);
        
        // For emulator testing, show a local notification to simulate the push notification
        if (!Device.isDevice) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '🔔 Test Push Notification',
              body: 'This is a simulated push notification for emulator testing!',
              data: {
                type: 'test',
                userId,
                timestamp: new Date().toISOString(),
              },
              sound: 'default',
            },
            trigger: { seconds: 1 } as Notifications.TimeIntervalTriggerInput,
          });
          console.log('📱 Simulated push notification scheduled for emulator');
        }
      } else {
        console.error('❌ Failed to send test notification:', result.message);
        setError(result.message);
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      setError('Failed to send test notification');
    } finally {
      setIsLoading(false);
    }
  };

  const clearNotification = (): void => {
    setNotification(null);
  };

  const clearError = (): void => {
    setError(null);
  };

  return {
    expoPushToken,
    notification,
    permissionStatus,
    isLoading,
    error,
    sendTestNotification,
    clearNotification,
    clearError,
    registerForPushNotificationsAsync,
  };
}; 