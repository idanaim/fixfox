import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './admin-dashboard-styles';
import { useBusinessSummary } from '../../hooks/useBusinessSummary';
import { useTranslation } from 'react-i18next';
import { useDashboardStore } from '../../store/dashboard.store';

interface BusinessAccountSectionProps {
  businessId: number | null;
  businessName?: string;
}

export const BusinessAccountSection: React.FC<BusinessAccountSectionProps> = ({
  businessId,
  businessName,
}) => {
  const { t } = useTranslation();
  const { selectedBusiness } = useDashboardStore();
  const { data: businessSummary, isLoading, error } = useBusinessSummary(businessId);



  // Show empty state if no business is selected
  if (!businessId) {
    return (
      <Surface style={styles.dashboardSummary}>
        <View style={styles.emptyState}>
          <Icon name="business-outline" size={48} color={styles.colors.medium} />
          <Text style={styles.emptyStateText}>
            {t('dashboard.selectBusinessToViewStats')}
          </Text>
        </View>
      </Surface>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <Surface style={styles.dashboardSummary}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={styles.colors.primary} />
          <Text style={styles.loadingText}>
            {t('dashboard.loadingBusinessStats')}
          </Text>
        </View>
      </Surface>
    );
  }

  // Show error state
  if (error || !businessSummary) {
    return (
      <Surface style={styles.dashboardSummary}>
        <View style={styles.emptyState}>
          <Icon name="alert-circle-outline" size={48} color={styles.colors.error} />
          <Text style={styles.emptyStateText}>
            {t('dashboard.errorLoadingStats')}
          </Text>
        </View>
      </Surface>
    );
  }

  return (
    <Surface style={styles.dashboardSummary}>
      {/* Business Name Header */}
      {businessName && (
        <View style={styles.businessHeader}>
          <Icon name="business-outline" size={20} color={styles.colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.businessHeaderText}>{businessName}</Text>
        </View>
      )}

      {/* Statistics Grid */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconContainer}>
            <Icon name="account-group" size={24} color={styles.colors.primary} />
          </View>
          <View>
            <Text style={styles.summaryValue}>{businessSummary.totalUsers}</Text>
            <Text style={styles.summaryLabel}>{t('dashboard.businessUsers')}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryIconContainer, { backgroundColor: 'rgba(236, 178, 46, 0.1)' }]}>
            <Icon name="ticket-outline" size={24} color={styles.colors.accent} />
          </View>
          <View>
            <Text style={styles.summaryValue}>{businessSummary.openIssues}</Text>
            <Text style={styles.summaryLabel}>{t('dashboard.openTickets')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIconContainer, { backgroundColor: 'rgba(224, 30, 90, 0.1)' }]}>
            <Icon name="progress-clock" size={24} color={styles.colors.error} />
          </View>
          <View>
            <Text style={styles.summaryValue}>{businessSummary.activeIssues}</Text>
            <Text style={styles.summaryLabel}>{t('dashboard.activeTickets')}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryIconContainer, { backgroundColor: 'rgba(46, 182, 125, 0.1)' }]}>
            <Icon name="check-circle" size={24} color={styles.colors.success} />
          </View>
          <View>
            <Text style={styles.summaryValue}>{businessSummary.closedIssues}</Text>
            <Text style={styles.summaryLabel}>{t('dashboard.closedTickets')}</Text>
          </View>
        </View>
      </View>
    </Surface>
  );
}; 