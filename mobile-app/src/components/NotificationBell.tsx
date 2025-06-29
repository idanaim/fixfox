import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Text, Card, IconButton, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useNotifications, useUnreadNotificationCount, useNotificationNavigation } from '../hooks/useNotifications';
import { Notification } from '../api/notificationAPI';

interface NotificationBellProps {
  businessId?: number;
  iconColor?: string;
  iconSize?: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  businessId,
  iconColor = '#fff',
  iconSize = 24,
}) => {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const { data: unreadCount = 0 } = useUnreadNotificationCount(businessId);
  const { data: notificationsData, isLoading, refetch } = useNotifications({
    businessId,
    limit: 20,
  });
  const { handleNotificationPress } = useNotificationNavigation();

  const notifications = notificationsData?.notifications || [];

  const handleBellPress = () => {
    setIsModalVisible(true);
    refetch(); // Refresh notifications when opened
  };

  const handleNotificationItemPress = async (notification: Notification) => {
    setIsModalVisible(false);
    await handleNotificationPress(notification);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'issue_assigned':
        return 'account-plus';
      case 'issue_status_changed':
        return 'update';
      case 'issue_resolved':
        return 'check-circle';
      case 'issue_escalated':
        return 'arrow-up-bold';
      default:
        return 'bell';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return '#FF4444';
      case 'high':
        return '#FF8800';
      case 'medium':
        return '#4CAF50';
      case 'low':
        return '#9E9E9E';
      default:
        return '#2196F3';
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.readAt && styles.unreadNotification
      ]}
      onPress={() => handleNotificationItemPress(item)}
    >
      <View style={styles.notificationHeader}>
        <Icon
          name={getNotificationIcon(item.type)}
          size={20}
          color={getPriorityColor(item.data?.priority)}
          style={styles.notificationIcon}
        />
        <Text style={styles.notificationTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.notificationTime}>
          {formatTime(item.createdAt)}
        </Text>
      </View>
      
      <Text style={styles.notificationMessage} numberOfLines={2}>
        {item.message}
      </Text>
      
      {item.data?.actionRequired && (
        <View style={styles.actionRequiredBadge}>
          <Text style={styles.actionRequiredText}>Action Required</Text>
        </View>
      )}
      
      {!item.readAt && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity style={styles.bellContainer} onPress={handleBellPress}>
        <Icon name="bell" size={iconSize} color={iconColor} />
        {unreadCount > 0 && (
          <Badge
            size={18}
            style={styles.badge}
          >
            {unreadCount > 99 ? '99+' : unreadCount.toString()}
          </Badge>
        )}
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t('notifications.title', 'Notifications')}
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setIsModalVisible(false)}
            />
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text>{t('common.loading', 'Loading...')}</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="bell-off" size={48} color="#ccc" />
              <Text style={styles.emptyText}>
                {t('notifications.empty', 'No notifications yet')}
              </Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderNotificationItem}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  bellContainer: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF4444',
    minWidth: 18,
    height: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: '#f8f9ff',
    borderColor: '#4CAF50',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationIcon: {
    marginRight: 8,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  actionRequiredBadge: {
    backgroundColor: '#FF8800',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  actionRequiredText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  unreadDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
});

export default NotificationBell; 