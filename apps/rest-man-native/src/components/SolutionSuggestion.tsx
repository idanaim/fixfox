import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, Surface, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography } from '../componentsBackup/admin-dashboard/admin-dashboard-styles';

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
}

type RootStackParamList = {
  Technicians: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SolutionSuggestion: React.FC<SolutionSuggestionProps> = ({
  solutions,
  onAcceptSolution,
  onRejectSolution,
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
            {currentSolution.treatment || currentSolution || t('solution.title')}
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
          <Button
            mode="outlined"
            onPress={() => onRejectSolution(currentSolution)}
            style={styles.rejectButton}
            labelStyle={styles.rejectButtonText}
          >
            {t('solution.actions.skip')}
          </Button>

          {currentSolutionIndex < solutions.length - 1 && (
            <Button
              mode="text"
              onPress={handleNextSolution}
              style={styles.nextButton}
              labelStyle={styles.nextButtonText}
            >
              {t('solution.actions.next')}
            </Button>
          )}
        </View>

        <View style={styles.buttonGroup}>
          <Button
            mode="contained"
            onPress={() => onAcceptSolution(currentSolution)}
            style={styles.acceptButton}
            labelStyle={styles.acceptButtonText}
          >
            {t('solution.actions.helped')}
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Technicians')}
            style={[styles.acceptButton, styles.technicianButton]}
            labelStyle={styles.acceptButtonText}
          >
            {t('solution.actions.getTechnician')}
          </Button>
        </View>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTitle: {
    ...typography.h3,
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
    color: colors.dark,
  },
  divider: {
    backgroundColor: colors.border,
  },
  solutionContent: {
    maxHeight: 300,
    padding: 16,
  },
  solutionInfo: {
    marginBottom: 16,
  },
  solutionTitle: {
    ...typography.h3,
    color: colors.dark,
    marginBottom: 4,
  },
  resolvedBy: {
    ...typography.caption,
    color: colors.medium,
    fontStyle: 'italic',
  },
  stepsContainer: {
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumber: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  stepText: {
    ...typography.body1,
    color: colors.dark,
    flex: 1,
  },
  partsContainer: {
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  partsSectionTitle: {
    ...typography.body2,
    color: colors.dark,
    fontWeight: 'bold',
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
    color: colors.medium,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.white,
    gap: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  rejectButton: {
    borderColor: colors.border,
    flex: 1,
  },
  rejectButtonText: {
    ...typography.button,
    color: colors.medium,
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
    flex: 1,
  },
  technicianButton: {
    backgroundColor: colors.success,
  },
  acceptButtonText: {
    ...typography.button,
    color: colors.white,
  },
});

export default SolutionSuggestion;
