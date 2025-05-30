import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Text,
  Chip,
  Button,
  Searchbar,
  Divider,
  ActivityIndicator,
  Surface,
  IconButton,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useIssueManagement } from '../../hooks/useIssues';
import { Issue, IssueFilters } from '../../api/issueAPI';

// Slack-inspired color palette (from the design system)
const colors = {
  primary: '#4A154B', // Slack purple
  secondary: '#36C5F0', // Slack blue
  accent: '#ECB22E', // Slack yellow
  success: '#2EB67D', // Slack green
  error: '#E01E5A', // Slack pink
  dark: '#1D1C1D', // Dark text
  medium: '#616061', // Medium gray text
  light: '#868686', // Light text
  lightGray: '#F8F8F8', // Background gray
  border: '#DDDDDD', // Border color
  white: '#FFFFFF',
};

// Typography scale
const typography = {
  h1: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: 0.25,
  },
  h2: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: 0.15,
  },
  h3: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.15,
  },
  body1: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
  },
  button: {
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 1.25,
  },
};

interface IssueTicketListProps {
  businessId: number;
  userId?: number;
  onIssuePress?: (issue: Issue) => void;
}

const statusColors = {
  open: '#FF9800',      // Orange
  assigned: '#2196F3',   // Blue
  in_progress: '#9C27B0', // Purple
  closed: '#4CAF50',     // Green
};

const statusLabels = {
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  closed: 'Closed',
};

// Slack-style Action Button Component
const SlackActionButton: React.FC<{
  onPress: () => void;
  icon?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium';
}> = ({ onPress, icon, children, variant = 'secondary', size = 'small' }) => {
  const getButtonStyle = () => {
    const baseStyle = {
      ...styles.slackButton,
      ...(size === 'small' ? styles.slackButtonSmall : styles.slackButtonMedium),
    };

    switch (variant) {
      case 'primary':
        return { ...baseStyle, backgroundColor: colors.primary };
      case 'danger':
        return { ...baseStyle, backgroundColor: colors.error };
      default:
        return { ...baseStyle, backgroundColor: colors.white, borderColor: colors.border };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return { ...styles.slackButtonText, color: colors.white };
      default:
        return { ...styles.slackButtonText, color: colors.dark };
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={getButtonStyle()}>
      {icon && (
        <Icon 
          name={icon} 
          size={size === 'small' ? 14 : 16} 
          color={variant === 'primary' || variant === 'danger' ? colors.white : colors.medium}
          style={styles.slackButtonIcon}
        />
      )}
      <Text style={getTextStyle()}>{children}</Text>
    </TouchableOpacity>
  );
};

const IssueTicketCard: React.FC<{
  issue: Issue;
  onPress?: () => void;
  onStatusUpdate: (issueId: number, status: string) => void;
  onAssignTechnician: (issueId: number) => void;
}> = ({ issue, onPress, onStatusUpdate, onAssignTechnician }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNextStatus = (currentStatus: string): string | null => {
    switch (currentStatus) {
      case 'open':
        return 'assigned';
      case 'assigned':
        return 'in_progress';
      case 'in_progress':
        return 'closed';
      default:
        return null;
    }
  };

  const getStatusAction = (status: string): { label: string; icon: string } => {
    switch (status) {
      case 'assigned':
        return { label: 'Start Work', icon: 'play' };
      case 'in_progress':
        return { label: 'Complete', icon: 'check' };
      case 'closed':
        return { label: 'Reopen', icon: 'refresh' };
      default:
        return { label: 'Assign', icon: 'account-plus' };
    }
  };

  const nextStatus = getNextStatus(issue.status);
  const statusAction = nextStatus ? getStatusAction(nextStatus) : null;

  return (
    <Card style={styles.issueCard} onPress={onPress}>
      <Card.Content>
        {/* Header with ID and Status */}
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.issueId}>
            #{issue.id}
          </Text>
          <Chip
            mode="flat"
            style={[
              styles.statusChip,
              { backgroundColor: statusColors[issue.status as keyof typeof statusColors] + '20' }
            ]}
            textStyle={{ color: statusColors[issue.status as keyof typeof statusColors] }}
          >
            {statusLabels[issue.status as keyof typeof statusLabels] || issue.status}
          </Chip>
        </View>

        {/* Problem Description */}
        <Text variant="bodyMedium" style={styles.problemDescription}>
          {issue.problem.description}
        </Text>

        {/* Equipment Info */}
        {issue.equipment && (
          <View style={styles.equipmentInfo}>
            <Text variant="bodySmall" style={styles.equipmentText}>
              📋 {issue.equipment.type}
              {issue.equipment.manufacturer && ` • ${issue.equipment.manufacturer}`}
              {issue.equipment.model && ` ${issue.equipment.model}`}
              {issue.equipment.location && ` • 📍 ${issue.equipment.location}`}
            </Text>
          </View>
        )}

        {/* People Involved */}
        <View style={styles.peopleInfo}>
          <Text variant="bodySmall" style={styles.personText}>
            👤 Opened by: {issue.openedBy.firstName} {issue.openedBy.lastName}
          </Text>
          {issue.assignedTo && (
            <Text variant="bodySmall" style={styles.personText}>
              🔧 Assigned to: {issue.assignedTo.firstName} {issue.assignedTo.lastName}
            </Text>
          )}
          {issue.solvedBy && (
            <Text variant="bodySmall" style={styles.personText}>
              ✅ Solved by: {issue.solvedBy.firstName} {issue.solvedBy.lastName}
            </Text>
          )}
        </View>

        {/* Solution Info */}
        {issue.solution && (
          <View style={styles.solutionInfo}>
            <Text variant="bodySmall" style={styles.solutionLabel}>
              💡 Solution Applied:
            </Text>
            <Text variant="bodySmall" style={styles.solutionText}>
              {issue.solution.treatment}
            </Text>
          </View>
        )}

        {/* Timestamp */}
        <Text variant="bodySmall" style={styles.timestamp}>
          📅 {formatDate(issue.createdAt)}
        </Text>

        {/* Slack-style Action Buttons */}
        <View style={styles.slackActionButtons}>
          {!issue.assignedTo && issue.status === 'open' && (
            <SlackActionButton
              onPress={() => onAssignTechnician(issue.id)}
              icon="account-plus"
              variant="primary"
              size="small"
            >
              Assign Tech
            </SlackActionButton>
          )}
          
          {statusAction && (
            <SlackActionButton
              onPress={() => onStatusUpdate(issue.id, nextStatus!)}
              icon={statusAction.icon}
              variant={nextStatus === 'closed' ? 'primary' : 'secondary'}
              size="small"
            >
              {statusAction.label}
            </SlackActionButton>
          )}

          {/* Quick Action: View Details */}
          <SlackActionButton
            onPress={() => {/* Handle view details */}}
            icon="eye"
            size="small"
          >
            Details
          </SlackActionButton>
        </View>
      </Card.Content>
    </Card>
  );
};

export const IssueTicketList: React.FC<IssueTicketListProps> = ({
  businessId,
  userId,
  onIssuePress,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [filters, setFilters] = useState<IssueFilters>({
    page: 1,
    limit: 20,
  });

  const {
    businessIssues,
    issueStats,
    isLoadingBusinessIssues,
    businessIssuesError,
    updateIssueStatus,
    assignTechnician,
    isUpdatingStatus,
    isAssigningTechnician,
    refetchBusinessIssues,
  } = useIssueManagement(businessId, userId);

  const filteredIssues = React.useMemo(() => {
    if (!businessIssues?.issues) return [];
    
    return businessIssues.issues.filter((issue) => {
      const matchesSearch = searchQuery === '' || 
        issue.problem.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.id.toString().includes(searchQuery) ||
        (issue.equipment?.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (issue.equipment?.manufacturer || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === '' || issue.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [businessIssues?.issues, searchQuery, statusFilter]);

  const handleStatusUpdate = (issueId: number, status: string) => {
    Alert.alert(
      'Update Status',
      `Are you sure you want to change this issue to "${statusLabels[status as keyof typeof statusLabels] || status}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            updateIssueStatus({
              issueId,
              status,
              businessId,
              userId,
            });
          },
        },
      ]
    );
  };

  const handleAssignTechnician = (issueId: number) => {
    // For now, we'll just assign to the default technician
    // In a real app, you'd show a technician picker
    Alert.alert(
      'Assign Technician',
      'This will assign the issue to the default technician. In a production app, you would see a list of available technicians.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign',
          onPress: () => {
            // Note: You'd need to get the technician ID from somewhere
            // For demo purposes, we'll use a placeholder
            assignTechnician({
              issueId,
              technicianId: 1, // Placeholder - should come from technician selection
              businessId,
            });
          },
        },
      ]
    );
  };

  if (businessIssuesError) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="bodyLarge" style={styles.errorText}>
          Error loading issues: {businessIssuesError.message}
        </Text>
        <Button mode="contained" onPress={() => refetchBusinessIssues()}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Stats */}
      {issueStats && (
        <Surface style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="titleMedium">{issueStats.total}</Text>
              <Text variant="bodySmall">Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="titleMedium" style={{ color: statusColors.open }}>
                {issueStats.open}
              </Text>
              <Text variant="bodySmall">Open</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="titleMedium" style={{ color: statusColors.assigned }}>
                {issueStats.assigned}
              </Text>
              <Text variant="bodySmall">Assigned</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="titleMedium" style={{ color: statusColors.in_progress }}>
                {issueStats.inProgress}
              </Text>
              <Text variant="bodySmall">In Progress</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="titleMedium" style={{ color: statusColors.closed }}>
                {issueStats.closed}
              </Text>
              <Text variant="bodySmall">Closed</Text>
            </View>
          </View>
        </Surface>
      )}

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search issues..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { key: '', label: 'All' },
            { key: 'open', label: 'Open' },
            { key: 'assigned', label: 'Assigned' },
            { key: 'in_progress', label: 'In Progress' },
            { key: 'closed', label: 'Closed' },
          ]}
          renderItem={({ item }) => (
            <Chip
              style={[
                styles.filterChip,
                statusFilter === item.key && styles.filterChipSelected
              ]}
              onPress={() => setStatusFilter(item.key)}
              mode={statusFilter === item.key ? 'flat' : 'outlined'}
            >
              {item.label}
            </Chip>
          )}
          keyExtractor={(item) => item.key}
        />
      </View>

      {/* Issues List */}
      {isLoadingBusinessIssues ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Loading issues...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredIssues}
          renderItem={({ item }) => (
            <IssueTicketCard
              issue={item}
              onPress={() => onIssuePress?.(item)}
              onStatusUpdate={handleStatusUpdate}
              onAssignTechnician={handleAssignTechnician}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingBusinessIssues}
              onRefresh={refetchBusinessIssues}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                {searchQuery || statusFilter
                  ? 'No issues match your search criteria'
                  : 'No issues found for this business'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#ffffff',
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#e3f2fd',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  issueCard: {
    elevation: 2,
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  issueId: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statusChip: {
    borderRadius: 16,
  },
  problemDescription: {
    marginBottom: 8,
    fontWeight: '500',
  },
  equipmentInfo: {
    marginBottom: 8,
  },
  equipmentText: {
    color: '#666',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
  },
  peopleInfo: {
    marginBottom: 8,
  },
  personText: {
    color: '#666',
    marginBottom: 2,
  },
  solutionInfo: {
    marginBottom: 8,
    backgroundColor: '#e8f5e8',
    padding: 8,
    borderRadius: 4,
  },
  solutionLabel: {
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
  },
  solutionText: {
    color: '#2e7d32',
  },
  timestamp: {
    color: '#999',
    marginBottom: 12,
  },
  // New Slack-style button styles
  slackActionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  slackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  slackButtonSmall: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 28,
  },
  slackButtonMedium: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 32,
  },
  slackButtonText: {
    ...typography.button,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0,
  },
  slackButtonIcon: {
    marginRight: 4,
  },
  // Remove old button styles
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#d32f2f',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
}); 