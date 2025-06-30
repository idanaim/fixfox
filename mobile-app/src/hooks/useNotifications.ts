import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { notificationAPI, Notification, NotificationResponse } from '../api/notificationAPI';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Query keys for React Query
export const notificationKeys = {
  all: ['notifications'] as const,
  user: (userId: number) => [...notificationKeys.all, 'user', userId] as const,
  userWithFilters: (userId: number, filters: any) => 
    [...notificationKeys.user(userId), filters] as const,
};

export const useNotifications = (options: {
  userId?: number;
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  businessId?: number;
} = {}) => {
  const userId = options.userId || 1; // Default to user 1 for testing
  
  return useQuery({
    queryKey: notificationKeys.userWithFilters(userId, options),
    queryFn: () => notificationAPI.getUserNotifications({
      ...options,
      userId,
    }),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ notificationId, userId = 1 }: { notificationId: number; userId?: number }) => 
      notificationAPI.markAsRead(notificationId, userId),
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all
      });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ businessId, userId = 1 }: { businessId?: number; userId?: number }) => 
      notificationAPI.markAllAsRead(businessId, userId),
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all
      });
    },
  });
};

export const useTestNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ businessId = 1, userId = 1 }: { businessId?: number; userId?: number }) => 
      notificationAPI.createTestNotification(businessId, userId),
    onSuccess: () => {
      // Invalidate and refetch notifications to show the new test notification
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all
      });
    },
  });
};

export const useNotificationNavigation = () => {
  const navigation = useNavigation<NavigationProp>();
  const markAsRead = useMarkAsRead();

  const handleNotificationPress = async (notification: Notification) => {
    try {
      // Mark notification as read
      if (!notification.readAt) {
        await markAsRead.mutateAsync({ 
          notificationId: notification.id,
          userId: notification.user.id 
        });
      }

      // Navigate to the specified route
      if (notification.data?.routeTo && notification.data?.routeParams) {
        const { routeTo, routeParams } = notification.data;
        
        // Type-safe navigation based on the route
        if (routeTo === 'IssueDetails' && routeParams.issueId) {
          navigation.navigate('IssueDetails', {
            issueId: routeParams.issueId,
            businessId: routeParams.businessId,
            userId: routeParams.userId,
          });
        } else {
          // Fallback navigation
          console.warn('Unknown route or missing params:', routeTo, routeParams);
        }
      } else if (notification.issue) {
        // Fallback: navigate to issue if notification has issue data
        navigation.navigate('IssueDetails', {
          issueId: notification.issue.id,
          businessId: notification.business.id,
        });
      }
    } catch (error) {
      console.error('Error handling notification press:', error);
    }
  };

  return {
    handleNotificationPress,
    isMarkingAsRead: markAsRead.isPending,
  };
};

// Hook for unread notification count
export const useUnreadNotificationCount = (businessId?: number, userId: number = 1) => {
  return useQuery({
    queryKey: notificationKeys.userWithFilters(userId, { unreadOnly: true, businessId }),
    queryFn: () => notificationAPI.getUserNotifications({ 
      userId,
      unreadOnly: true, 
      businessId,
      limit: 100 // Get all unread notifications to count them
    }),
    select: (data: NotificationResponse) => data.notifications.length,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}; 