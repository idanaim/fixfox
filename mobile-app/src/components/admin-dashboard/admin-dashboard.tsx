import React, { useState, useEffect } from 'react';
import { View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text, Divider, IconButton } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './admin-dashboard-styles';
import { EmployeeSection } from './employee-section';
import { ApplianceSection } from './appliance-section/appliance-section';
import { AddApplianceForm } from './appliance-section/AddApplianceForm';

import { BusinessAccountSection } from './BusinessAccountSection';
import useAuthStore from '../../store/auth.store';
import { useTranslation } from 'react-i18next';
import { IssueTicketList } from '../ticket-management/IssueTicketList';
import DashboardHeader from './DashboardHeader';
import { useDashboardStore } from '../../store/dashboard.store';
import BottomNavigation from '../BottomNavigation';

type TabType = 'users' | 'appliances' | 'tickets' | 'settings';

interface AdminDashboardProps {
  initialTab?: TabType;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'users' }) => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const routeParams = route.params as any;
  const [activeTab, setActiveTab] = useState<TabType>(routeParams?.activeTab || initialTab);
  const [showAddApplianceForm, setShowAddApplianceForm] = useState(false);
  const [applianceRefreshTrigger, setApplianceRefreshTrigger] = useState(0);

  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { selectedBusiness } = useDashboardStore();

  // Debug logging
  console.log('AdminDashboard - selectedBusiness:', selectedBusiness);

  // Remove chat navigation useEffect - will be handled by app navigator

  const handleHeaderBack = () => {
    navigation.goBack();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <EmployeeSection />;
      case 'appliances':
        return <ApplianceSection key={applianceRefreshTrigger} />;
      case 'tickets':
        return <IssueTicketList businessId={selectedBusiness?.id || 0} onIssuePress={(issue)=> console.log(issue)} userId={user?.id || 0} navigation={navigation} i18nIsDynamicList />;
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
      <DashboardHeader
        title=""
        onBackPress={handleHeaderBack}
        showBackButton={true}
      />

      <BusinessAccountSection
        businessId={selectedBusiness?.id || null}
        businessName={selectedBusiness?.name}
      />

      <View style={styles.contentContainer}>
        <View style={styles.contentHeader}>
          <Text style={styles.contentTitle}>
            {activeTab === 'users' ? t('admin.sections.userManagement') :
             activeTab === 'appliances' ? t('admin.sections.applianceManagement') :
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
          {activeTab === 'appliances' && (
            <IconButton
              icon="plus"
              size={24}
              style={styles.addButton}
              iconColor={styles.colors.primary}
              onPress={() => setShowAddApplianceForm(true)}
            />
          )}
          {activeTab === 'tickets' && (
            <IconButton
              icon="plus"
              size={24}
              style={styles.addButton}
              iconColor={styles.colors.primary}
              onPress={() => navigation.navigate('AIChat', {
                businessId: selectedBusiness?.id,
                businessName: selectedBusiness?.name
              })}
            />
          )}
        </View>

        <Divider />

        <ScrollView style={styles.scrollContent}>
          {renderTabContent()}
        </ScrollView>
      </View>

      <BottomNavigation 
        activeTab={activeTab} 
        onTabPress={(tab) => setActiveTab(tab as TabType)} 
      />



      {/* Add Appliance Form */}
      <AddApplianceForm
        visible={showAddApplianceForm}
        onClose={() => setShowAddApplianceForm(false)}
        onSuccess={() => {
          setApplianceRefreshTrigger(prev => prev + 1);
        }}
      />
    </SafeAreaView>
  );
};

export default AdminDashboard;

