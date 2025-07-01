import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import { Avatar, Appbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from './admin-dashboard-styles';
import useAuthStore from '../../store/auth.store';
import { useBusinesses } from '../../hooks/useBusinesses';
import LanguageSwitcher from '../LanguageSwitcher';
import { useTestNotification } from '../../hooks/useNotifications';
import NotificationBell from '../NotificationBell';
import { PushNotificationManager } from '../PushNotificationManager';

interface DashboardHeaderProps {
  title: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  onBackPress,
  showBackButton = true,
}) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { businesses, selectedBusiness, setSelectedBusiness } = useBusinesses();
  const [isBusinessModalVisible, setIsBusinessModalVisible] = useState(false);
  const testNotification = useTestNotification();

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const toggleBusinessModal = () => {
    setIsBusinessModalVisible(!isBusinessModalVisible);
  };

  const handleSelectBusiness = (business: any) => {
    console.log('Business selected:', business);
    setSelectedBusiness(business);
    setIsBusinessModalVisible(false);
  };

  const handleTestNotification = async () => {
    const businessId = selectedBusiness?.id || 1; // Default to business 1
    const userId = 1; // Default to user 1 for testing

    try {
      await testNotification.mutateAsync({ businessId, userId });
      Alert.alert(
        '🔔 Test Notification Sent!',
        'Check your notifications list to see the test notification.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to send test notification. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Test notification error:', error);
    }
  };

  return (
    <>
      <Appbar.Header style={styles.header}>
        {showBackButton && (
          <Appbar.BackAction onPress={onBackPress} color={colors.white} />
        )}

        <View style={styles.leftSection}>
          {/* User Avatar */}
          <TouchableOpacity style={styles.avatarContainer}>
            {user?.photoUrl ? (
              <Avatar.Image
                size={36}
                source={{ uri: user.photoUrl }}
                style={styles.avatar}
              />
            ) : (
              <Avatar.Text
                size={36}
                label={getUserInitials()}
                style={styles.avatar}
                color={colors.white}
                labelStyle={styles.avatarLabel}
              />
            )}
          </TouchableOpacity>

          {/* Business Dropdown */}
          <TouchableOpacity
            style={styles.businessDropdown}
            onPress={toggleBusinessModal}
          >
            <Ionicons name="business-outline" size={16} color={colors.white} />
            <Text style={styles.businessText} numberOfLines={1}>
              {selectedBusiness?.name || t('dashboard.selectBusiness')}
            </Text>
            <Ionicons
              name={isBusinessModalVisible ? "chevron-up" : "chevron-down"}
              size={14}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* Spacer for better layout */}
        <View style={styles.spacer} />

        {/* Right Actions */}
        <View style={styles.rightSection}>
          <View style={styles.languageSwitcherContainer}>
            <LanguageSwitcher />
          </View>
          <NotificationBell
            businessId={selectedBusiness?.id}
            iconColor={colors.white}
            iconSize={24}
          />
          <Appbar.Action
            icon="bell-ring"
            color={colors.white}
            onPress={handleTestNotification}
          />
          <Appbar.Action
            icon="dots-vertical"
            color={colors.white}
            onPress={() => {}}
          />
        </View>
      </Appbar.Header>

      {/* Business Selection Modal */}
      <Modal
        visible={isBusinessModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleBusinessModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={toggleBusinessModal}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('dashboard.selectBusiness')}</Text>
              <TouchableOpacity onPress={toggleBusinessModal}>
                <Ionicons name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={businesses}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.businessItem,
                    selectedBusiness?.id === item.id && styles.selectedBusinessItem
                  ]}
                  onPress={() => handleSelectBusiness(item)}
                >
                  <View style={styles.businessItemContent}>
                    <Ionicons name="business-outline" size={20} color={colors.primary} />
                    <Text style={styles.businessName}>{item.name}</Text>
                  </View>
                  {selectedBusiness?.id === item.id && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Push Notification Manager */}
      <PushNotificationManager userId={22} compact={true} showTestButton={true} />

      {/* Test Notification Button */}
      <TouchableOpacity style={styles.testButton} onPress={handleTestNotification}>
        <Text style={styles.testButtonText}>🔔 Test In-App + Push Notification</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    backgroundColor: colors.secondary,
  },
  avatarLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  businessDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 12,
    maxWidth: 200,
  },
  businessText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
    marginRight: 6,
    flex: 1,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageSwitcherContainer: {
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark,
  },
  listContent: {
    padding: 16,
  },
  businessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: colors.lightGray,
  },
  selectedBusinessItem: {
    backgroundColor: colors.lightGray,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  businessItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    color: colors.dark,
    marginLeft: 12,
    fontWeight: '500',
  },
  testButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default DashboardHeader;
