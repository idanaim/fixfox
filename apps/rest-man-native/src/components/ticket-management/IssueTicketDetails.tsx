import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  TextInput,
  Chip,
  Divider,
  ActivityIndicator,
  Surface,
  Menu,
  IconButton,
  Dialog,
  Portal,
  RadioButton,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useIssueById, useAssignTechnician, useUpdateIssueComprehensive } from '../../hooks/useIssues';
import { Issue } from '../../api/issueAPI';

// Slack-inspired color palette
const colors = {
  primary: '#4A154B',
  secondary: '#36C5F0',
  accent: '#ECB22E',
  success: '#2EB67D',
  error: '#E01E5A',
  dark: '#1D1C1D',
  medium: '#616061',
  light: '#868686',
  lightGray: '#F8F8F8',
  border: '#DDDDDD',
  white: '#FFFFFF',
};

const typography = {
  h1: { fontSize: 22, fontWeight: '700' as const, letterSpacing: 0.25 },
  h2: { fontSize: 18, fontWeight: '700' as const, letterSpacing: 0.15 },
  h3: { fontSize: 16, fontWeight: '600' as const, letterSpacing: 0.15 },
  body1: { fontSize: 15, fontWeight: '400' as const, letterSpacing: 0.5 },
  body2: { fontSize: 14, fontWeight: '400' as const, letterSpacing: 0.25 },
  caption: { fontSize: 12, fontWeight: '400' as const, letterSpacing: 0.4 },
  button: { fontSize: 14, fontWeight: '500' as const, letterSpacing: 1.25 },
};

interface IssueTicketDetailsProps {
  issueId: number;
  businessId: number;
  userId?: number;
  onClose?: () => void;
}

const statusColors = {
  open: '#FF9800',
  assigned: '#2196F3',
  in_progress: '#9C27B0',
  closed: '#4CAF50',
};

const statusLabels = {
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  closed: 'Closed',
};

interface UpdateIssueFormData {
  status: string;
  cost: string;
  treatment: string;
  shouldClose: boolean;
}

export const IssueTicketDetails: React.FC<IssueTicketDetailsProps> = ({
  issueId,
  businessId,
  userId,
  onClose,
}) => {
  // State for the unified update form
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [formData, setFormData] = useState<UpdateIssueFormData>({
    status: '',
    cost: '',
    treatment: '',
    shouldClose: false,
  });

  // Data fetching and mutations
  const { data: issue, isLoading, error, refetch } = useIssueById(issueId, businessId);
  const updateComprehensive = useUpdateIssueComprehensive();
  const assignTechnician = useAssignTechnician();

  // Initialize form when opening
  const handleOpenUpdateForm = () => {
    if (issue) {
      setFormData({
        status: issue.status,
        cost: issue.cost?.toString() || '',
        treatment: issue.solution?.treatment || '',
        shouldClose: issue.status === 'closed',
      });
    }
    setShowUpdateForm(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAssignTechnician = () => {
    Alert.alert(
      'Assign Technician',
      'This will assign the issue to the default technician.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign',
          onPress: () => {
            assignTechnician.mutate({
              issueId,
              technicianId: 1, // Placeholder - should come from technician selection
              businessId,
            });
          },
        },
      ]
    );
  };

  const handleUpdateIssue = async () => {
    try {
      const costValue = formData.cost && !isNaN(parseFloat(formData.cost)) ? parseFloat(formData.cost) : undefined;
      const treatmentValue = formData.treatment.trim() || undefined;

      // Make a single comprehensive update call
      await updateComprehensive.mutateAsync({
        issueId,
        status: formData.status !== issue?.status ? formData.status : undefined,
        cost: costValue,
        treatment: treatmentValue,
        shouldClose: formData.shouldClose,
        businessId,
        userId,
      });

      setShowUpdateForm(false);
      Alert.alert('Success', 'Issue updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update issue');
    }
  };

  const handleCallExternalTechnician = () => {
    Alert.alert(
      'Call External Technician',
      'This feature will connect you with external technician services. Implementation coming soon.',
      [{ text: 'OK' }]
    );
  };

  const isFormValid = () => {
    if (formData.shouldClose || formData.status === 'closed') {
      return true; // Closing with optional cost/treatment is always valid
    }
    return formData.status !== ''; // At minimum, status should be selected
  };

  const isUpdating = updateComprehensive.isPending;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading issue details...</Text>
      </View>
    );
  }

  if (error || !issue) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={48} color={colors.error} />
        <Text style={styles.errorText}>
          {error?.message || 'Issue not found'}
        </Text>
        <Button mode="contained" onPress={() => refetch()}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Surface style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.issueTitle}>Issue #{issue.id}</Text>
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
          {onClose && (
            <IconButton icon="close" size={24} onPress={onClose} />
          )}
        </View>
        <Text style={styles.problemDescription}>{issue.problem.description}</Text>
        <Text style={styles.createdAt}>Created: {formatDate(issue.createdAt)}</Text>
      </Surface>

      {/* Business Information */}
      <Card style={styles.section}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon name="domain" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Business Information</Text>
          </View>
          <Text style={styles.businessName}>{issue.business.name}</Text>
        </Card.Content>
      </Card>

      {/* Equipment Details */}
      {issue.equipment && (
        <Card style={styles.section}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Icon name="tools" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Equipment Details</Text>
            </View>
            <View style={styles.equipmentDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>{issue.equipment.type}</Text>
              </View>
              {issue.equipment.manufacturer && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Manufacturer:</Text>
                  <Text style={styles.detailValue}>{issue.equipment.manufacturer}</Text>
                </View>
              )}
              {issue.equipment.model && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Model:</Text>
                  <Text style={styles.detailValue}>{issue.equipment.model}</Text>
                </View>
              )}
              {issue.equipment.location && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Location:</Text>
                  <Text style={styles.detailValue}>{issue.equipment.location}</Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* People Involved */}
      <Card style={styles.section}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon name="account-group" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>People Involved</Text>
          </View>
          <View style={styles.peopleList}>
            <View style={styles.personRow}>
              <Icon name="account" size={20} color={colors.medium} />
              <Text style={styles.personLabel}>Opened by:</Text>
              <Text style={styles.personName}>
                {issue.openedBy.firstName} {issue.openedBy.lastName}
              </Text>
            </View>
            {issue.assignedTo && (
              <View style={styles.personRow}>
                <Icon name="account-wrench" size={20} color={colors.medium} />
                <Text style={styles.personLabel}>Assigned to:</Text>
                <Text style={styles.personName}>
                  {issue.assignedTo.firstName} {issue.assignedTo.lastName}
                </Text>
              </View>
            )}
            {issue.solvedBy && (
              <View style={styles.personRow}>
                <Icon name="account-check" size={20} color={colors.success} />
                <Text style={styles.personLabel}>Solved by:</Text>
                <Text style={styles.personName}>
                  {issue.solvedBy.firstName} {issue.solvedBy.lastName}
                </Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Solution & Treatment */}
      <Card style={styles.section}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon name="lightbulb" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Solution & Treatment</Text>
          </View>

          {issue.solution && (
            <View style={styles.solutionContainer}>
              <Text style={styles.solutionLabel}>
                {issue.solution.resolvedBy === 'AI' ? 'AI Solution Applied:' : 'Treatment Applied:'}
              </Text>
              <Text style={styles.solutionText}>{issue.solution.treatment}</Text>
            </View>
          )}

          {issue.cost !== null && issue.cost !== undefined && (
            <View style={styles.costContainer}>
              <Text style={styles.costLabel}>Cost:</Text>
              <Text style={styles.costValue}>${issue.cost}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <Card style={styles.actionsSection}>
        <Card.Content>
          <Text style={styles.actionsTitle}>Actions</Text>

          <View style={styles.actionButtonsGrid}>
            {/* Update Issue - Main Action */}
            <Button
              mode="contained"
              onPress={handleOpenUpdateForm}
              icon="pencil"
              style={[styles.actionButton, styles.primaryButton]}
            >
              Update Issue
            </Button>

            {/* Assign Technician */}
            {!issue.assignedTo && (
              <Button
                mode="outlined"
                onPress={handleAssignTechnician}
                icon="account-plus"
                style={styles.actionButton}
                loading={assignTechnician.isPending}
              >
                Assign Technician
              </Button>
            )}

            {/* Call External Technician - Separate Action */}
            <Button
              mode="outlined"
              onPress={handleCallExternalTechnician}
              icon="phone"
              style={[styles.actionButton, styles.externalButton]}
            >
              Call External Tech
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Unified Update Form Dialog */}
      <Portal>
        <Dialog visible={showUpdateForm} onDismiss={() => setShowUpdateForm(false)} style={styles.updateDialog}>
          <Dialog.Title style={styles.dialogTitle}>Update Issue</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={styles.dialogContent}>
              {/* Status Section */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>Status</Text>
                <RadioButton.Group 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))} 
                  value={formData.status}
                >
                  {['open', 'assigned', 'in_progress', 'closed'].map(status => (
                    <View key={status} style={styles.radioOption}>
                      <RadioButton value={status} />
                      <Text style={styles.radioLabel}>
                        {statusLabels[status as keyof typeof statusLabels]}
                      </Text>
                    </View>
                  ))}
                </RadioButton.Group>
              </View>

              <Divider style={styles.formDivider} />

              {/* Cost Section */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>Cost</Text>
                <TextInput
                  label="Cost Amount ($)"
                  value={formData.cost}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, cost: value }))}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.formInput}
                />
              </View>

              <Divider style={styles.formDivider} />

              {/* Treatment Section */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>Treatment Description</Text>
                <TextInput
                  label="Treatment Description"
                  value={formData.treatment}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, treatment: value }))}
                  multiline
                  numberOfLines={4}
                  mode="outlined"
                  style={styles.formInput}
                />
              </View>

              <Divider style={styles.formDivider} />

              {/* Close Option */}
              <View style={styles.formSection}>
                <View style={styles.closeOption}>
                  <RadioButton
                    value="close"
                    status={formData.shouldClose ? 'checked' : 'unchecked'}
                    onPress={() => setFormData(prev => ({ ...prev, shouldClose: !prev.shouldClose }))}
                  />
                  <Text style={styles.closeOptionLabel}>Close this issue</Text>
                </View>
                <Text style={styles.closeOptionHint}>
                  This will close the issue with the current cost and treatment
                </Text>
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowUpdateForm(false)}>Cancel</Button>
            <Button 
              onPress={handleUpdateIssue} 
              loading={isUpdating}
              disabled={!isFormValid()}
              mode="contained"
            >
              Update
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  loadingText: {
    marginTop: 16,
    ...typography.body1,
    color: colors.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 20,
    ...typography.body1,
    color: colors.error,
    textAlign: 'center',
  },
  header: {
    margin: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  issueTitle: {
    ...typography.h2,
    color: colors.dark,
  },
  statusChip: {
    borderRadius: 16,
  },
  problemDescription: {
    ...typography.body1,
    color: colors.dark,
    marginBottom: 8,
    lineHeight: 22,
  },
  createdAt: {
    ...typography.caption,
    color: colors.medium,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.dark,
  },
  businessName: {
    ...typography.body1,
    color: colors.dark,
    fontWeight: '500',
  },
  equipmentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
  },
  detailLabel: {
    ...typography.body2,
    color: colors.medium,
    width: 100,
  },
  detailValue: {
    ...typography.body2,
    color: colors.dark,
    flex: 1,
    fontWeight: '500',
  },
  peopleList: {
    gap: 12,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  personLabel: {
    ...typography.body2,
    color: colors.medium,
    width: 80,
  },
  personName: {
    ...typography.body2,
    color: colors.dark,
    fontWeight: '500',
  },
  solutionContainer: {
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  solutionLabel: {
    ...typography.caption,
    color: colors.medium,
    marginBottom: 4,
    fontWeight: '600',
  },
  solutionText: {
    ...typography.body2,
    color: colors.dark,
    lineHeight: 20,
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  costLabel: {
    ...typography.body2,
    color: colors.medium,
  },
  costValue: {
    ...typography.body1,
    color: colors.dark,
    fontWeight: '600',
  },
  actionsSection: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    elevation: 1,
  },
  actionsTitle: {
    ...typography.h3,
    color: colors.dark,
    marginBottom: 16,
  },
  actionButtonsGrid: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  externalButton: {
    borderColor: colors.secondary,
  },
  updateDialog: {
    width: '90%',
    maxWidth: 400,
  },
  dialogTitle: {
    ...typography.h2,
    color: colors.dark,
  },
  dialogContent: {
    padding: 16,
  },
  formSection: {
    marginBottom: 16,
  },
  formSectionTitle: {
    ...typography.h3,
    color: colors.dark,
    marginBottom: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioLabel: {
    ...typography.body1,
    color: colors.dark,
  },
  formDivider: {
    marginVertical: 12,
  },
  formInput: {
    marginBottom: 12,
  },
  closeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  closeOptionLabel: {
    ...typography.body1,
    color: colors.dark,
  },
  closeOptionHint: {
    ...typography.caption,
    color: colors.medium,
  },
});
