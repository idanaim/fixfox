import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { usePushNotifications } from '../hooks/usePushNotifications';

interface PushNotificationManagerProps {
  userId?: number;
  showTestButton?: boolean;
  compact?: boolean;
}

export const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({
  userId = 22,
  showTestButton = true,
  compact = false,
}) => {
  const {
    expoPushToken,
    notification,
    permissionStatus,
    isLoading,
    error,
    sendTestNotification,
    clearNotification,
    clearError,
  } = usePushNotifications(userId);

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert(
        'Success', 
        'Test push notification sent! 🔔📱' + 
        (expoPushToken?.includes('emulator') 
          ? '\n\nSince you\'re on an emulator, a local notification will appear in 1 second to simulate the push notification.' 
          : '\n\nCheck your notification panel.')
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const getPermissionStatusColor = () => {
    switch (permissionStatus) {
      case 'granted':
        return '#4CAF50';
      case 'denied':
        return '#F44336';
      default:
        return '#FF9800';
    }
  };

  const getPermissionStatusText = () => {
    switch (permissionStatus) {
      case 'granted':
        return '✅ Granted';
      case 'denied':
        return '❌ Denied';
      default:
        return '⏳ Pending';
    }
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.statusRow}>
          <Text style={styles.compactLabel}>Push Notifications:</Text>
          <Text style={[styles.permissionStatus, { color: getPermissionStatusColor() }]}>
            {getPermissionStatusText()}
          </Text>
        </View>
        {showTestButton && permissionStatus === 'granted' && (
          <TouchableOpacity
            style={[styles.testButton, styles.compactButton]}
            onPress={handleTestNotification}
            disabled={isLoading}
          >
            <Text style={styles.testButtonText}>
              {isLoading ? '⏳' : '🔔'} Test
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Push Notifications</Text>
      
      {/* Permission Status */}
      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>Permission Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={[styles.permissionStatus, { color: getPermissionStatusColor() }]}>
            {getPermissionStatusText()}
          </Text>
        </View>
      </View>

      {/* Push Token Info */}
      {expoPushToken && (
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Push Token</Text>
          <Text style={styles.tokenText} numberOfLines={2} ellipsizeMode="middle">
            {expoPushToken}
          </Text>
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View style={styles.errorSection}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearError}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Current Notification */}
      {notification && (
        <View style={styles.notificationSection}>
          <Text style={styles.sectionTitle}>Latest Notification</Text>
          <View style={styles.notificationCard}>
            <Text style={styles.notificationTitle}>
              {notification.request.content.title}
            </Text>
            <Text style={styles.notificationBody}>
              {notification.request.content.body}
            </Text>
            {notification.request.content.data && (
              <Text style={styles.notificationData}>
                Data: {JSON.stringify(notification.request.content.data, null, 2)}
              </Text>
            )}
            <TouchableOpacity style={styles.clearButton} onPress={clearNotification}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Test Button */}
      {showTestButton && permissionStatus === 'granted' && (
        <TouchableOpacity
          style={[styles.testButton, isLoading && styles.disabledButton]}
          onPress={handleTestNotification}
          disabled={isLoading}
        >
          <Text style={styles.testButtonText}>
            {isLoading ? '⏳ Sending...' : '🔔 Send Test Notification'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Permission Denied Help */}
      {permissionStatus === 'denied' && (
        <View style={styles.helpSection}>
          <Text style={styles.helpText}>
            Push notifications are disabled. Please enable them in your device settings to receive notifications.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 8,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    marginVertical: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  statusSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  compactLabel: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  permissionStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  tokenText: {
    fontSize: 10,
    color: '#888',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  errorSection: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#c62828',
    fontSize: 12,
    flex: 1,
  },
  notificationSection: {
    marginBottom: 16,
  },
  notificationCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  notificationBody: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  notificationData: {
    fontSize: 10,
    color: '#888',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  testButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  compactButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 60,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  helpSection: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#e65100',
    textAlign: 'center',
  },
}); 