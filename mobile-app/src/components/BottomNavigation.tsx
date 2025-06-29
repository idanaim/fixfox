import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors, typography, shadows } from './admin-dashboard/admin-dashboard-styles';
import { useDashboardStore } from '../store/dashboard.store';

interface BottomNavigationProps {
  activeTab?: string;
  onTabPress?: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  activeTab: propActiveTab, 
  onTabPress 
}) => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { t } = useTranslation();
  const { selectedBusiness } = useDashboardStore();
  
  // Determine active tab based on route name or prop
  const activeTab = propActiveTab || (route.name === 'ChatScreen' ? 'chat' : 'users');

  const handleTabPress = (tab: string) => {
    // Always handle chat navigation directly
    if (tab === 'chat') {
      navigation.navigate('ChatScreen', {
        businessId: selectedBusiness?.id,
        businessName: selectedBusiness?.name
      });
      return;
    }

    // For other tabs, use the callback if provided, otherwise navigate to Dashboard
    if (onTabPress) {
      onTabPress(tab);
    } else {
      navigation.navigate('Dashboard', {
        activeTab: tab,
        businessId: selectedBusiness?.id,
        businessName: selectedBusiness?.name
      });
    }
  };

  return (
    <View style={styles.bottomNavigation}>
      <TouchableOpacity
        style={[styles.navButton, activeTab === 'users' && styles.activeNavButton]}
        onPress={() => handleTabPress('users')}
      >
        <Icon
          name="account-group"
          size={24}
          color={activeTab === 'users' ? colors.primary : colors.medium}
        />
        <Text style={[styles.navButtonLabel, activeTab === 'users' && styles.activeNavButtonLabel]}>
          {t('admin.navigation.users')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navButton, activeTab === 'appliances' && styles.activeNavButton]}
        onPress={() => handleTabPress('appliances')}
      >
        <Icon
          name="devices"
          size={24}
          color={activeTab === 'appliances' ? colors.primary : colors.medium}
        />
        <Text style={[styles.navButtonLabel, activeTab === 'appliances' && styles.activeNavButtonLabel]}>
          {t('admin.navigation.appliances')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navButton, activeTab === 'tickets' && styles.activeNavButton]}
        onPress={() => handleTabPress('tickets')}
      >
        <Icon
          name="ticket-outline"
          size={24}
          color={activeTab === 'tickets' ? colors.primary : colors.medium}
        />
        <Text style={[styles.navButtonLabel, activeTab === 'tickets' && styles.activeNavButtonLabel]}>
          {t('admin.navigation.tickets')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navButton, activeTab === 'chat' && styles.activeNavButton]}
        onPress={() => handleTabPress('chat')}
      >
        <Icon
          name="chat"
          size={24}
          color={activeTab === 'chat' ? colors.primary : colors.medium}
        />
        <Text style={[styles.navButtonLabel, activeTab === 'chat' && styles.activeNavButtonLabel]}>
          {t('admin.navigation.chat')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navButton, activeTab === 'settings' && styles.activeNavButton]}
        onPress={() => handleTabPress('settings')}
      >
        <Icon
          name="cog"
          size={24}
          color={activeTab === 'settings' ? colors.primary : colors.medium}
        />
        <Text style={[styles.navButtonLabel, activeTab === 'settings' && styles.activeNavButtonLabel]}>
          {t('admin.navigation.settings')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  bottomNavigation: {
    flexDirection: 'row' as const,
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingBottom: 12, // Extra padding for safe area
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.small,
  },
  navButton: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  activeNavButton: {
    backgroundColor: 'rgba(74, 21, 75, 0.1)',
    borderRadius: 8,
  },
  navButtonLabel: {
    ...typography.caption,
    color: colors.medium,
    marginTop: 2,
    fontSize: 10,
    textAlign: 'center' as const,
  },
  activeNavButtonLabel: {
    color: colors.primary,
    fontWeight: '600' as const,
  },
};

export default BottomNavigation; 