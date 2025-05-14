import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from '../admin-dashboard-styles';
import { useAccountSummary } from '../../../queries/react-query-wrapper/use-account-summary';

interface AccountSectionProps {
  accountId?: string;
  // Fallback data if API call fails or data is loading
  fallbackStats?: {
    activeUsers: number;
    businesses: number;
    openTickets: number;
    resolvedToday: number;
  };
}

export const AccountSection: React.FC<AccountSectionProps> = ({
  accountId = '1', // Default account ID - replace with actual default if available
  fallbackStats = {
    activeUsers: 0,
    businesses: 0,
    openTickets: 0,
    resolvedToday: 0
  }
}) => {
  // Fetch account summary from the API
  const { data, isLoading, isError } = useAccountSummary(accountId);

  // Use API data if available, otherwise use fallback stats
  const stats = {
    activeUsers: data?.totalUsers ?? fallbackStats.activeUsers,
    businesses: data?.totalBusinesses ?? fallbackStats.businesses,
    openTickets: data?.openIssuesCount ?? fallbackStats.openTickets,
    resolvedToday: fallbackStats.resolvedToday // We don't have this in the API yet
  };

  return (
    <Surface style={styles.dashboardSummary}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={styles.colors.primary} />
        </View>
      ) : (
        <>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <Icon name="account-group" size={24} color={styles.colors.primary} />
              </View>
              <View>
                <Text style={styles.summaryValue}>{stats.activeUsers}</Text>
                <Text style={styles.summaryLabel}>Active Users</Text>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <View style={[styles.summaryIconContainer, { backgroundColor: 'rgba(46, 182, 125, 0.1)' }]}>
                <Icon name="domain" size={24} color={styles.colors.success} />
              </View>
              <View>
                <Text style={styles.summaryValue}>{stats.businesses}</Text>
                <Text style={styles.summaryLabel}>Businesses</Text>
              </View>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIconContainer, { backgroundColor: 'rgba(236, 178, 46, 0.1)' }]}>
                <Icon name="ticket-outline" size={24} color={styles.colors.accent} />
              </View>
              <View>
                <Text style={styles.summaryValue}>{stats.openTickets}</Text>
                <Text style={styles.summaryLabel}>Open Tickets</Text>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <View style={[styles.summaryIconContainer, { backgroundColor: 'rgba(224, 30, 90, 0.1)' }]}>
                <Icon name="calendar-check" size={24} color={styles.colors.error} />
              </View>
              <View>
                <Text style={styles.summaryValue}>{stats.resolvedToday}</Text>
                <Text style={styles.summaryLabel}>Resolved Today</Text>
              </View>
            </View>
          </View>
        </>
      )}
    </Surface>
  );
};
