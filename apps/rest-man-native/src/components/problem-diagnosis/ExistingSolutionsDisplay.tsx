import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Surface, Divider, Button } from 'react-native-paper';
import { Problem } from '../../api/chatAPI';
import { colors, typography } from '../../componentsBackup/admin-dashboard/admin-dashboard-styles';
import { useTranslation } from 'react-i18next';

interface ExistingSolutionsDisplayProps {
  problems: Problem[];
  currentBusinessId: number;
  onSolutionSelect?: (problem: Problem) => void;
  onRequestMoreInfo?: () => void;
  onImproveDescription?: () => void;
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
}) => {
  const { t } = useTranslation();

  if (!problems || problems.length === 0) {
    return (
      <EmptyState
        onRequestMoreInfo={onRequestMoreInfo}
        onImproveDescription={onImproveDescription}
      />
    );
  }

  const renderProblemItem = ({ item }: { item: Problem }) => {
    const isBusiness = item.equipment && (item.equipment.businessId === currentBusinessId);
    const hasSolutions = item.solutions && item.solutions.length > 0;
    const solutionCount = item.solutions?.length || 0;
    const firstSolution = item.solutions?.[0];
    const badgeColor = isBusiness ? colors.success : colors.secondary;

    return (
      <Surface style={styles.problemCard}>
        <TouchableOpacity
          onPress={() => onSolutionSelect && onSolutionSelect(item)}
          style={styles.problemItem}
          activeOpacity={0.7}
        >
          <View style={styles.problemHeader}>
            <View style={styles.sourceContainer}>
              <Icon
                name={isBusiness ? "domain" : "earth"}
                size={18}
                color={badgeColor}
                style={styles.sourceIcon}
              />
              <Text style={styles.sourceText}>
                {isBusiness ? t('solution.source.business') : t('solution.source.community')}
              </Text>
            </View>
            {hasSolutions && (
              <View style={[styles.badgeContainer, { backgroundColor: badgeColor + '20' }]}>
                <Text style={[styles.badgeText, { color: badgeColor }]}>
                  {`${solutionCount} ${solutionCount === 1 ? t('solution.title') : t('solution.title') + 's'}`}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.problemTitle}>{item.description}</Text>

          {hasSolutions && firstSolution && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.solutionPreview}>
                <View style={styles.solutionHeader}>
                  <Icon name="lightbulb-outline" size={16} color={colors.primary} />
                  <Text style={styles.solutionPreviewLabel}>
                    {t('solution.title')}:
                  </Text>
                </View>
                <Text style={styles.solutionPreviewText} numberOfLines={2}>
                  {firstSolution.treatment}
                </Text>
                <View style={styles.solutionMeta}>
                  <Icon name="account-outline" size={14} color={colors.medium} />
                  <Text style={styles.solutionMetaText}>
                    {t('solution.resolvedBy', { name: firstSolution.resolvedBy })}
                  </Text>
                </View>
              </View>
            </>
          )}

          <View style={styles.actionContainer}>
            <Text style={styles.actionText}>{t('common.viewDetails')}</Text>
            <Icon name="chevron-right" size={20} color={colors.primary} />
          </View>
        </TouchableOpacity>
      </Surface>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={problems}
        keyExtractor={(item) => (item.id || 0).toString()}
        renderItem={renderProblemItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
        overScrollMode="always"
        ListFooterComponent={
          onImproveDescription ? (
            <View style={styles.footerContainer}>
              <Button
                mode="outlined"
                onPress={onImproveDescription}
                style={styles.improveButton}
                icon="pencil-outline"
              >
                {t('diagnosis.emptyState.improveDescription')}
              </Button>
            </View>
          ) : null
        }
      />
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
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
});

export default ExistingSolutionsDisplay;
