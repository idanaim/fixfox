import React, { useState } from 'react';
import { View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Appbar, Text, Divider, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './admin-dashboard-styles';
import { EmployeeSection } from './employee-section';
import { BusinessSection } from './business-section/business-section';
import { TicketsManagement } from '../tickets-management/fixfox-tickets-management';
import { ChatButton } from '../ChatButton';
import { AccountSection } from './account-section/account-section';
import useAuthStore from '../../store/auth.store';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

type TabType = 'users' | 'businesses' | 'tickets' | 'settings';

const AdminDashboard = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [showAddBusinessModal, setShowAddBusinessModal] = useState(false);
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const handleHeaderBack = () => {
    navigation.goBack();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <EmployeeSection />;
      case 'businesses':
        return <BusinessSection showAddBusinessModal={showAddBusinessModal} setShowAddBusinessModal={setShowAddBusinessModal} />;
      case 'tickets':
        return <TicketsManagement />;
      case 'settings':
        return (
          <View style={styles.comingSoonContainer}>
            <Icon name="cog" size={48} color={styles.colors.medium} />
            <Text style={styles.comingSoonText}>{t('admin.settings.comingSoon')}</Text>
          </View>
        );
      default:
        return <></>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={handleHeaderBack} color={styles.colors.white} />
        <Appbar.Content
          title={t('admin.dashboard.title')}
          titleStyle={styles.headerTitle}
        />
        <Appbar.Action
          icon="magnify"
          color={styles.colors.white}
          onPress={() => {}}
        />
        <View style={styles.languageSwitcherContainer}>
          <LanguageSwitcher />
        </View>
        <Appbar.Action
          icon="dots-vertical"
          color={styles.colors.white}
          onPress={() => {}}
        />
      </Appbar.Header>

      <AccountSection 
        accountId={user?.accountId || '1'} 
        fallbackStats={{
          activeUsers: 28,
          businesses: 5,
          openTickets: 12,
          resolvedToday: 8
        }}
      />

      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.navButton, activeTab === 'users' && styles.activeNavButton]}
          onPress={() => setActiveTab('users')}
        >
          <Icon
            name="account-group"
            size={24}
            color={activeTab === 'users' ? styles.colors.primary : styles.colors.medium}
          />
          <Text style={styles.navButtonLabel}>{t('admin.navigation.users')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, activeTab === 'businesses' && styles.activeNavButton]}
          onPress={() => setActiveTab('businesses')}
        >
          <Icon
            name="domain"
            size={24}
            color={activeTab === 'businesses' ? styles.colors.primary : styles.colors.medium}
          />
          <Text style={styles.navButtonLabel}>{t('admin.navigation.businesses')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, activeTab === 'tickets' && styles.activeNavButton]}
          onPress={() => setActiveTab('tickets')}
        >
          <Icon
            name="ticket-outline"
            size={24}
            color={activeTab === 'tickets' ? styles.colors.primary : styles.colors.medium}
          />
          <Text style={styles.navButtonLabel}>{t('admin.navigation.tickets')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, activeTab === 'settings' && styles.activeNavButton]}
          onPress={() => setActiveTab('settings')}
        >
          <Icon
            name="cog"
            size={24}
            color={activeTab === 'settings' ? styles.colors.primary : styles.colors.medium}
          />
          <Text style={styles.navButtonLabel}>{t('admin.navigation.settings')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.contentHeader}>
          <Text style={styles.contentTitle}>
            {activeTab === 'users' ? t('admin.sections.userManagement') :
             activeTab === 'businesses' ? t('admin.sections.businessManagement') :
             activeTab === 'tickets' ? t('admin.sections.ticketManagement') : t('admin.sections.systemSettings')}
          </Text>
          {activeTab === 'users' && (
            <IconButton
              icon="plus"
              size={24}
              style={styles.addButton}
              iconColor={styles.colors.primary}
              onPress={() => navigation.navigate('user-form', { user: null })}
            />
          )}
          {activeTab === 'businesses' && (
            <IconButton
              icon="plus"
              size={24}
              style={styles.addButton}
              iconColor={styles.colors.primary}
              onPress={() => setShowAddBusinessModal(true)}
            />
          )}
          {activeTab === 'tickets' && (
            <IconButton
              icon="plus"
              size={24}
              style={styles.addButton}
              iconColor={styles.colors.primary}
              onPress={() => navigation.navigate('AIChat')}
            />
          )}
        </View>

        <Divider />

        <ScrollView style={styles.scrollContent}>
          {renderTabContent()}
        </ScrollView>
      </View>

      <ChatButton
        variant="fab"
        size="large"
        hasNotifications={true}
        notificationCount={3}
      />
    </SafeAreaView>
  );
};

export default AdminDashboard;

