import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, Surface, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography } from '../admin-dashboard/admin-dashboard-styles';

interface Solution {
  treatment: string;
  problemId?: string;
  resolvedBy?: string;
  parts?: string[];
}

interface SolutionSuggestionProps {
  solutions: Solution[];
  onAcceptSolution: (solution: Solution) => void;
  onRejectSolution: (solution: Solution) => void;
  onAssignToTechnician?: () => void;
}

type RootStackParamList = {
  Technicians: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SolutionSuggestion: React.FC<SolutionSuggestionProps> = ({
  solutions,
  onAcceptSolution,
  onRejectSolution,
  onAssignToTechnician,
}) => {
  const { t } = useTranslation();
  const [currentSolutionIndex, setCurrentSolutionIndex] = useState(0);
  const currentSolution = solutions[currentSolutionIndex];
  const navigation = useNavigation<NavigationProp>();

  const handleNextSolution = () => {
    if (currentSolutionIndex < solutions.length - 1) {
      setCurrentSolutionIndex(currentSolutionIndex + 1);
    }
  };

  const formatSolutionSteps = (treatment: string): string[] => {
    const rawSteps = treatment?.split(/(?:\n|\.(?=\s|$)|(?:\d+\.))/g);
    return rawSteps
      ?.filter((step) => step.trim().length > 0)
      ?.map((step) => step.trim());
  };

  if (!currentSolution) {
    return null;
  }

  const steps = formatSolutionSteps(currentSolution.treatment);
  const isBusiness = currentSolution?.problemId !== undefined;

  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <Icon
          name="lightbulb-outline"
          size={24}
          color={colors.primary}
          style={styles.headerIcon}
        />
        <Text style={styles.headerTitle}>{t('solution.title')}</Text>
        <View style={styles.sourceBadge}>
          <Icon
            name={isBusiness ? 'domain' : 'earth'}
            size={16}
            color={isBusiness ? colors.success : colors.secondary}
            style={styles.sourceBadgeIcon}
          />
          <Text style={styles.sourceBadgeText}>
            {t(`solution.source.${isBusiness ? 'business' : 'community'}`)}
          </Text>
        </View>
      </View>

      <Divider style={styles.divider} />

      <ScrollView style={styles.solutionContent}>
        <View style={styles.solutionInfo}>
          <Text style={styles.solutionTitle}>
            {currentSolution.treatment || t('solution.title')}
          </Text>

          {currentSolution?.resolvedBy && (
            <Text style={styles.resolvedBy}>
              {t('solution.resolvedBy', { name: currentSolution.resolvedBy })}
            </Text>
          )}
        </View>

        <View style={styles.stepsContainer}>
          {steps?.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {currentSolution?.parts && currentSolution.parts.length > 0 && (
          <View style={styles.partsContainer}>
            <Text style={styles.partsSectionTitle}>{t('solution.partsRequired')}</Text>
            {currentSolution.parts.map((part: string, index: number) => (
              <View key={index} style={styles.partItem}>
                <Icon
                  name="circle-small"
                  size={20}
                  color={colors.medium}
                  style={styles.partBullet}
                />
                <Text style={styles.partText}>{part}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Divider style={styles.divider} />

      <View style={styles.footer}>
        <View style={styles.buttonGroup}>
          {onAssignToTechnician && (
            <Button
              mode="outlined"
              onPress={onAssignToTechnician}
              style={styles.assignButton}
              labelStyle={styles.assignButtonText}
              contentStyle={styles.buttonContent}
              icon="account-wrench"
              compact
            >
              {t('solution.actions.assignTechnician', { defaultValue: 'Assign Technician' })}
            </Button>
          )}

          {currentSolutionIndex < solutions.length - 1 && (
            <Button
              mode="text"
              onPress={handleNextSolution}
              style={styles.nextButton}
              labelStyle={styles.nextButtonText}
              contentStyle={styles.buttonContent}
              compact
            >
              {t('solution.actions.next')}
            </Button>
          )}
        </View>

        <Button
          mode="contained"
          onPress={() => onAcceptSolution(currentSolution)}
          style={styles.acceptButton}
          labelStyle={styles.acceptButtonText}
          contentStyle={styles.buttonContent}
          icon="check-circle-outline"
          compact
        >
          {t('solution.actions.helped')}
        </Button>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    borderRadius: 6,
    overflow: 'hidden',
    maxHeight: 450,
    backgroundColor: colors.white,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.white,
    minHeight: 48,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.dark,
    flex: 1,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sourceBadgeIcon: {
    marginRight: 4,
  },
  sourceBadgeText: {
    ...typography.caption,
    color: colors.medium,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
  },
  solutionContent: {
    padding: 12,
  },
  solutionInfo: {
    marginBottom: 12,
  },
  solutionTitle: {
    ...typography.body1,
    color: colors.dark,
    marginBottom: 4,
  },
  resolvedBy: {
    ...typography.caption,
    color: colors.medium,
  },
  stepsContainer: {
    marginTop: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepNumberContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  stepNumber: {
    ...typography.caption,
    color: colors.dark,
  },
  stepText: {
    ...typography.body2,
    color: colors.dark,
    flex: 1,
  },
  partsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 6,
  },
  partsSectionTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: 8,
  },
  partItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  partBullet: {
    marginRight: 4,
  },
  partText: {
    ...typography.body2,
    color: colors.dark,
    flex: 1,
  },
  footer: {
    padding: 12,
    backgroundColor: colors.white,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  assignButton: {
    flex: 1,
    marginRight: 8,
  },
  assignButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  nextButton: {
    flex: 1,
  },
  nextButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  acceptButton: {
    backgroundColor: colors.primary,
  },
  acceptButtonText: {
    ...typography.button,
    color: colors.white,
  },
  buttonContent: {
    height: 36,
  },
});

export default SolutionSuggestion;
