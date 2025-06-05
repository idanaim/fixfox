import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Badge } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography } from './admin-dashboard/admin-dashboard-styles';

interface ChatButtonProps {
  ticketId?: number;
  equipmentId?: number;
  hasNotifications?: boolean;
  notificationCount?: number;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'icon' | 'pill' | 'fab';
}

export const ChatButton: React.FC<ChatButtonProps> = ({ 
  ticketId, 
  equipmentId, 
  hasNotifications = false,
  notificationCount = 0,
  label = '',
  size = 'medium',
  variant = 'fab'
}) => {
  const navigation = useNavigation<any>();

  const handlePress = async () => {
    // Default values
    const userId = 22;
    const businessId = 6;

    navigation.navigate('Chat', {
      userId,
      businessId,
      ticketId,
      equipmentId
    });
  };

  // Determine icon size based on the size prop
  const getIconSize = () => {
    switch (size) {
      case 'small': return 18;
      case 'large': return 28;
      case 'medium':
      default: return 24;
    }
  };

  const renderContent = () => {
    if (variant === 'icon') {
      return (
        <View style={styles.iconContainer}>
          <Icon name="chat" size={getIconSize()} color={colors.white} />
          {hasNotifications && (
            <Badge
              style={styles.badge}
              size={16}
            >
              {notificationCount > 0 ? notificationCount : ''}
            </Badge>
          )}
        </View>
      );
    } else if (variant === 'pill') {
      return (
        <View style={styles.pillContent}>
          <Icon name="chat" size={getIconSize()} color={colors.white} style={styles.pillIcon} />
          <Text style={styles.pillText}>{label || 'Chat Support'}</Text>
          {hasNotifications && (
            <Badge
              style={styles.pillBadge}
              size={16}
            >
              {notificationCount > 0 ? notificationCount : ''}
            </Badge>
          )}
        </View>
      );
    } else { // fab
      return (
        <View style={styles.fabContainer}>
          <Icon name="chat" size={getIconSize()} color={colors.white} />
          {hasNotifications && (
            <Badge
              style={styles.badge}
              size={16}
            >
              {notificationCount > 0 ? notificationCount : ''}
            </Badge>
          )}
        </View>
      );
    }
  };

  const getButtonStyle = () => {
    if (variant === 'icon') {
      return [styles.iconButton, styles[`${size}Button`]];
    } else if (variant === 'pill') {
      return [styles.pillButton, styles[`${size}PillButton`]];
    } else { // fab
      return [styles.fabButton, styles[`${size}FabButton`]];
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={getButtonStyle()}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  pillButton: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabButton: {
    backgroundColor: colors.primary,
    borderRadius: 28,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    bottom: 16,
    right: 16,
  },
  iconContainer: {
    position: 'relative',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillIcon: {
    marginRight: 8,
  },
  pillText: {
    ...typography.button,
    color: colors.white,
  },
  fabContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.error,
  },
  pillBadge: {
    marginLeft: 8,
    backgroundColor: colors.error,
  },
  smallButton: {
    width: 36,
    height: 36,
  },
  mediumButton: {
    width: 44,
    height: 44,
  },
  largeButton: {
    width: 54,
    height: 54,
  },
  smallPillButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  mediumPillButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  largePillButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  smallFabButton: {
    width: 48,
    height: 48,
  },
  mediumFabButton: {
    width: 56,
    height: 56,
  },
  largeFabButton: {
    width: 64,
    height: 64,
  },
}); 