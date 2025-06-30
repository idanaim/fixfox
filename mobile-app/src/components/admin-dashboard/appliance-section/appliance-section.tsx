import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from '../admin-dashboard-styles';
import { useTranslation } from 'react-i18next';
import { useDashboardStore } from '../../../store/dashboard.store';
import { Equipment } from '../../../api/chatAPI';
import { useAppliances } from '../../../queries/react-query-wrapper/use-appliances';
import { AddApplianceForm } from './AddApplianceForm';

interface ApplianceSectionProps {
  onAppliancePress?: (appliance: Equipment) => void;
}

export const ApplianceSection: React.FC<ApplianceSectionProps> = ({
  onAppliancePress,
}) => {
  const { t } = useTranslation();
  const { selectedBusiness } = useDashboardStore();
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Fetch appliances from API
  const { 
    data: appliances = [], 
    isLoading: loading, 
    error,
    refetch 
  } = useAppliances(selectedBusiness?.id || null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return 'check-circle';
      case 'maintenance_needed':
        return 'alert-circle';
      case 'under_repair':
        return 'wrench';
      case 'retired':
        return 'archive';
      default:
        return 'help-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return styles.colors.success;
      case 'maintenance_needed':
        return styles.colors.accent;
      case 'under_repair':
        return styles.colors.error;
      case 'retired':
        return styles.colors.medium;
      default:
        return styles.colors.medium;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'HVAC':
        return 'air-conditioner';
      case 'Kitchen':
        return 'stove';
      case 'Refrigeration':
        return 'fridge';
      case 'Cleaning':
        return 'washing-machine';
      case 'Office':
        return 'printer';
      default:
        return 'devices';
    }
  };

  const handleAppliancePress = (appliance: Equipment) => {
    if (onAppliancePress) {
      onAppliancePress(appliance);
    } else {
      Alert.alert(
        t('appliances.applianceDetails'),
        `${appliance.manufacturer} ${appliance.model}\n${t('appliances.location')}: ${appliance.location}\n${t('appliances.status')}: ${appliance.status}`
      );
    }
  };

  const renderApplianceItem = ({ item: appliance }: { item: Equipment }) => (
    <TouchableOpacity
      style={slackStyles.applianceCard}
      onPress={() => handleAppliancePress(appliance)}
      activeOpacity={0.7}
    >
      <View style={slackStyles.cardContainer}>
        {/* Left side: Icon and main info */}
        <View style={slackStyles.leftSection}>
          <View style={[slackStyles.iconContainer, { backgroundColor: getStatusColor(appliance.status || '') + '10' }]}>
            <Icon
              name={getCategoryIcon(appliance.category || '')}
              size={20}
              color={getStatusColor(appliance.status || '')}
            />
          </View>
          
          <View style={slackStyles.mainInfo}>
            <Text style={slackStyles.applianceName}>
              {appliance.manufacturer} {appliance.model}
            </Text>
            <Text style={slackStyles.applianceType}>
              {appliance.type}
            </Text>
            <View style={slackStyles.metaRow}>
              <Icon name="map-marker" size={12} color={styles.colors.medium} />
              <Text style={slackStyles.metaText}>{appliance.location}</Text>
              <Text style={slackStyles.metaDivider}>•</Text>
              <Text style={slackStyles.metaText}>{appliance.serialNumber}</Text>
            </View>
          </View>
        </View>

        {/* Right side: Status badge */}
        <View style={slackStyles.rightSection}>
          <View style={[slackStyles.statusBadge, { backgroundColor: getStatusColor(appliance.status || '') }]}>
            <Icon
              name={getStatusIcon(appliance.status || '')}
              size={12}
              color="#FFFFFF"
            />
            <Text style={slackStyles.statusText}>
              {t(`appliances.status.${appliance.status}`)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!selectedBusiness) {
    return (
      <View style={slackStyles.container}>
        <View style={slackStyles.emptyState}>
          <View style={slackStyles.emptyIconContainer}>
            <Icon name="business" size={48} color="#868686" />
          </View>
          <Text style={slackStyles.emptyTitle}>
            {t('appliances.selectBusinessFirst')}
          </Text>
          <Text style={slackStyles.emptySubtitle}>
            {t('appliances.selectBusinessToViewAppliances')}
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={slackStyles.container}>
        <View style={slackStyles.emptyState}>
          <ActivityIndicator size="large" color="#007A5A" style={{ marginBottom: 16 }} />
          <Text style={slackStyles.emptyTitle}>
            {t('appliances.loadingAppliances')}
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={slackStyles.container}>
        <View style={slackStyles.emptyState}>
          <View style={slackStyles.emptyIconContainer}>
            <Icon name="alert-circle" size={48} color="#E01E5A" />
          </View>
          <Text style={slackStyles.emptyTitle}>
            {t('appliances.errorLoadingAppliances')}
          </Text>
          <Text style={slackStyles.emptySubtitle}>
            {error instanceof Error ? error.message : t('appliances.tryAgainLater')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={slackStyles.container}>
      <FlatList
        data={appliances}
        renderItem={renderApplianceItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={slackStyles.listContainer}
        ItemSeparatorComponent={() => <View style={slackStyles.separator} />}
        ListEmptyComponent={
          <View style={slackStyles.emptyState}>
            <View style={slackStyles.emptyIconContainer}>
              <Icon name="devices" size={48} color="#868686" />
            </View>
            <Text style={slackStyles.emptyTitle}>
              {t('appliances.noAppliances')}
            </Text>
            <Text style={slackStyles.emptySubtitle}>
              {t('appliances.addFirstAppliance')}
            </Text>
            <TouchableOpacity
              style={slackStyles.addButton}
              onPress={() => setShowAddForm(true)}
              activeOpacity={0.8}
            >
              <Icon name="plus" size={16} color="#FFFFFF" />
              <Text style={slackStyles.addButtonText}>{t('appliances.form.addAppliance')}</Text>
            </TouchableOpacity>
          </View>
        }
      />
      
      {/* Floating Action Button */}
      {selectedBusiness && appliances.length > 0 && (
        <TouchableOpacity
          style={slackStyles.fab}
          onPress={() => setShowAddForm(true)}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Add Appliance Form */}
      <AddApplianceForm
        visible={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={() => {
          refetch();
        }}
      />
    </View>
  );
};

// Slack-UI inspired styles
const slackStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContainer: {
    paddingVertical: 8,
  },
  separator: {
    height: 1,
  },
  applianceCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    minHeight: 72,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mainInfo: {
    flex: 1,
  },
  applianceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D1C1D',
    marginBottom: 2,
  },
  applianceType: {
    fontSize: 13,
    fontWeight: '400',
    color: '#616061',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#868686',
    marginLeft: 4,
  },
  metaDivider: {
    fontSize: 12,
    color: '#868686',
    marginHorizontal: 6,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1C1D',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#616061',
    textAlign: 'center',
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007A5A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007A5A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
}); 