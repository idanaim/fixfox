import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Surface, Divider, Button } from 'react-native-paper';
import { Problem } from '../../../api/chatAPI';
import { colors, typography } from '../../admin-dashboard/admin-dashboard-styles';
import { useTranslation } from 'react-i18next';

interface ExistingSolutionsDisplayProps {
  problems: Problem[];
  currentBusinessId: number;
  onSolutionSelect?: (problem: Problem) => void;
  onRequestMoreInfo?: () => void;
  onImproveDescription?: () => void;
  onAssignToTechnician?: () => void;
  onGetAISolutions?: () => void;
  onSolutionHelped?: (solutionText: string) => void;
  showAssignTechnician?: boolean;
  isLoadingAI?: boolean;
}

const EmptyState: React.FC<{
  onRequestMoreInfo?: () => void;
  onImproveDescription?: () => void;
}> = ({ onRequestMoreInfo, onImproveDescription }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.emptyContainer}>
      <Icon name="lightbulb-off-outline" size={48} color={colors.medium} style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>{t('diagnosis.emptyState.title')}</Text>
      <Text style={styles.emptyText}>{t('diagnosis.emptyState.message')}</Text>
      <View style={styles.emptyActions}>
        {onImproveDescription && (
          <Button
            mode="contained"
            onPress={onImproveDescription}
            style={[styles.emptyButton, styles.primaryButton]}
            icon="pencil-outline"
          >
            {t('diagnosis.emptyState.improveDescription')}
          </Button>
        )}
        {onRequestMoreInfo && (
          <Button
            mode="outlined"
            onPress={onRequestMoreInfo}
            style={[styles.emptyButton, styles.secondaryButton]}
            icon="help-circle-outline"
          >
            {t('diagnosis.emptyState.action')}
          </Button>
        )}
      </View>
    </View>
  );
};

const ExistingSolutionsDisplay: React.FC<ExistingSolutionsDisplayProps> = ({
  problems,
  currentBusinessId,
  onSolutionSelect,
  onRequestMoreInfo,
  onImproveDescription,
  onAssignToTechnician,
  onGetAISolutions,
  onSolutionHelped,
  showAssignTechnician = true,
  isLoadingAI = false,
}) => {
  const { t } = useTranslation();

  if (!problems || problems.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          onRequestMoreInfo={onRequestMoreInfo}
          onImproveDescription={onImproveDescription}
        />
        {/* Floating Action Buttons */}
        {showAssignTechnician && (onAssignToTechnician || onGetAISolutions) && (
          <View style={styles.floatingButtonContainer}>
            <View style={styles.buttonRow}>
              {onGetAISolutions && (
                <Button
                  mode="outlined"
                  onPress={onGetAISolutions}
                  style={[styles.floatingButton, styles.secondaryFloatingButton]}
                  icon={isLoadingAI ? undefined : "robot"}
                  contentStyle={styles.floatingButtonContent}
                  labelStyle={styles.secondaryFloatingButtonLabel}
                  compact
                  disabled={isLoadingAI}
                >
                  {isLoadingAI ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text style={[styles.secondaryFloatingButtonLabel, styles.loadingText]}>
                        {t('diagnosis.generatingAI', { defaultValue: 'Generating...' })}
                      </Text>
                    </View>
                  ) : (
                    t('diagnosis.getAISolutions', { defaultValue: 'Get AI Solutions' })
                  )}
                </Button>
              )}
              {onAssignToTechnician && (
                <Button
                  mode="contained"
                  onPress={onAssignToTechnician}
                  style={[styles.floatingButton, styles.primaryFloatingButton]}
                  icon="account-wrench"
                  contentStyle={styles.floatingButtonContent}
                  labelStyle={styles.floatingButtonLabel}
                  compact
                >
                  {t('diagnosis.assignToTechnician')}
                </Button>
              )}
            </View>
          </View>
        )}
      </View>
    );
  }

  const renderProblemItem = ({ item }: { item: Problem }) => (
    <TouchableOpacity
      style={styles.problemItem}
      onPress={() => onSolutionSelect?.(item)}
    >
      <Surface style={styles.surface} elevation={1}>
        <View style={styles.problemContent}>
          <View style={styles.problemHeader}>
            <Text style={[styles.problemDescription, { flex: 1 }]}>{item.description}</Text>
            {item.solutions && item.solutions.length > 0 && item.solutions[0].effectiveness !== undefined && (
              <View style={styles.effectivenessBadge}>
                <Icon name="thumb-up" size={12} color={colors.white} />
                <Text style={styles.effectivenessText}>{item.solutions[0].effectiveness}</Text>
              </View>
            )}
          </View>
          {item.solutions && item.solutions.length > 0 && (
            <View style={styles.solutionPreview}>
              <Text style={styles.solutionText}>
                {item.solutions[0].treatment}
              </Text>
              {onSolutionHelped && (
                <View style={styles.buttonContainer}>
                  <Button
                    mode="outlined"
                    onPress={() => onSolutionHelped(item.solutions![0].treatment)}
                    style={styles.helpedButton}
                    contentStyle={styles.helpedButtonContent}
                    labelStyle={styles.helpedButtonLabel}
                    icon="check-circle-outline"
                    compact
                  >
                    {t('diagnosis.thisHelped', { defaultValue: 'This helped me!' })}
                  </Button>
                </View>
              )}
            </View>
          )}
        </View>
      </Surface>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={problems}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderProblemItem}
        style={[styles.list, { maxHeight: 300 }]}
        contentContainerStyle={{ paddingBottom: showAssignTechnician && (onAssignToTechnician || onGetAISolutions) ? 60 : 16 }}
        showsVerticalScrollIndicator={true}
      />

      {/* Floating Action Buttons */}
      {showAssignTechnician && (onAssignToTechnician || onGetAISolutions) && (
        <View style={styles.floatingButtonContainer}>
          <View style={styles.buttonRow}>
            {onGetAISolutions && (
              <Button
                mode="outlined"
                onPress={onGetAISolutions}
                style={[styles.floatingButton, styles.secondaryFloatingButton]}
                icon={isLoadingAI ? undefined : "robot"}
                contentStyle={styles.floatingButtonContent}
                labelStyle={styles.secondaryFloatingButtonLabel}
                compact
                disabled={isLoadingAI}
              >
                {isLoadingAI ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.secondaryFloatingButtonLabel, styles.loadingText]}>
                      {t('diagnosis.generatingAI', { defaultValue: 'Generating...' })}
                    </Text>
                  </View>
                ) : (
                  t('diagnosis.getAISolutions', { defaultValue: 'Get AI Solutions' })
                )}
              </Button>
            )}
            {onAssignToTechnician && (
              <Button
                mode="contained"
                onPress={onAssignToTechnician}
                style={[styles.floatingButton, styles.primaryFloatingButton]}
                icon="account-wrench"
                contentStyle={styles.floatingButtonContent}
                labelStyle={styles.floatingButtonLabel}
                compact
              >
                {t('diagnosis.assignToTechnician')}
              </Button>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    gap: 12,
    paddingBottom: 24,
  },
  problemCard: {
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  problemItem: {
    padding: 16,
  },
  problemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceIcon: {
    marginRight: 6,
  },
  sourceText: {
    ...typography.caption,
    color: colors.medium,
  },
  solutionBadge: {
    borderRadius: 12,
  },
  solutionBadgeLabel: {
    ...typography.caption,
    fontWeight: '600',
  },
  problemTitle: {
    ...typography.body1,
    color: colors.dark,
    marginBottom: 12,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: 12,
  },
  solutionPreview: {
    marginBottom: 12,
  },
  solutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  solutionPreviewLabel: {
    ...typography.caption,
    color: colors.dark,
    fontWeight: '600',
    marginLeft: 6,
  },
  solutionPreviewText: {
    ...typography.body2,
    color: colors.medium,
    marginBottom: 8,
  },
  solutionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  solutionMetaText: {
    ...typography.caption,
    color: colors.medium,
    fontStyle: 'italic',
    marginLeft: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionText: {
    ...typography.button,
    color: colors.primary,
    marginRight: 4,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body1,
    color: colors.medium,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyActions: {
    width: '100%',
    gap: 12,
  },
  emptyButton: {
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    borderColor: colors.primary,
  },
  footerContainer: {
    padding: 16,
    paddingTop: 8,
  },
  improveButton: {
    borderRadius: 8,
    borderColor: colors.primary,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  floatingButton: {
    borderRadius: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    flex: 1,
  },
  floatingButtonContent: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 36,
  },
  floatingButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    gap: 12,
    paddingBottom: 24,
  },
  surface: {
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  problemContent: {
    padding: 16,
  },
  problemDescription: {
    ...typography.body1,
    color: colors.dark,
    marginBottom: 12,
  },
  solutionText: {
    ...typography.body2,
    color: colors.medium,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryFloatingButton: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  secondaryFloatingButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  primaryFloatingButton: {
    backgroundColor: colors.primary,
  },
  effectivenessBadge: {
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  effectivenessText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 4,
    fontSize: 11,
  },
  helpedButton: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
    borderRadius: 6,
    minHeight: 28,
  },
  helpedButtonContent: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    minHeight: 28,
  },
  helpedButtonLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
  },
});

export default ExistingSolutionsDisplay;
