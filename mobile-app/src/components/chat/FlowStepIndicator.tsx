import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Surface, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { FlowStep } from '../../store/chat.store';
import { colors, typography } from '../admin-dashboard/admin-dashboard-styles';

interface FlowStepIndicatorProps {
  currentStep: FlowStep;
  flowHistory: FlowStep[];
}

const FLOW_STEPS: { step: FlowStep; icon: string; label: string }[] = [
  { step: 'initial', icon: 'message-text', label: 'flow.step1' },
  { step: 'appliance_recognition', icon: 'robot', label: 'flow.step2a' },
  { step: 'appliance_selection', icon: 'check-circle', label: 'flow.step2b' },
  { step: 'checking_open_issues', icon: 'folder-search', label: 'flow.step3' },
  { step: 'follow_up_questions', icon: 'help-circle', label: 'flow.step4' },
  { step: 'checking_similar_issues', icon: 'magnify', label: 'flow.step5' },
  { step: 'matching_solutions', icon: 'database-search', label: 'flow.step6' },
  { step: 'solution_presentation', icon: 'lightbulb', label: 'flow.step7' },
  { step: 'solution_testing', icon: 'test-tube', label: 'flow.step8' },
  { step: 'solution_feedback', icon: 'thumb-up', label: 'flow.step9' },
  { step: 'ai_solution_generation', icon: 'brain', label: 'flow.step10' },
  { step: 'ai_solution_testing', icon: 'check-bold', label: 'flow.step11' },
  { step: 'technician_assignment', icon: 'account-wrench', label: 'flow.step12' },
  { step: 'completed', icon: 'check-all', label: 'flow.completed' },
];

const FlowStepIndicator: React.FC<FlowStepIndicatorProps> = ({
  currentStep,
  flowHistory,
}) => {
  const { t } = useTranslation();

  const getCurrentStepIndex = () => {
    return FLOW_STEPS.findIndex(step => step.step === currentStep);
  };

  const getProgress = () => {
    const currentIndex = getCurrentStepIndex();
    return currentIndex >= 0 ? (currentIndex + 1) / FLOW_STEPS.length : 0;
  };

  const getCurrentStepInfo = () => {
    return FLOW_STEPS.find(step => step.step === currentStep);
  };

  const stepInfo = getCurrentStepInfo();
  const progress = getProgress();

  if (!stepInfo || currentStep === 'initial') {
    return null; // Don't show indicator for initial step
  }

  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <Icon name={stepInfo.icon} size={16} color={colors.primary} />
        <Text style={styles.stepText}>
          {t(stepInfo.label, { defaultValue: stepInfo.step.replace(/_/g, ' ') })}
        </Text>
      </View>
      <ProgressBar 
        progress={progress} 
        color={colors.primary}
        style={styles.progressBar}
      />
      <Text style={styles.progressText}>
        {t('flow.step_progress', { 
          current: getCurrentStepIndex() + 1, 
          total: FLOW_STEPS.length,
          defaultValue: `Step ${getCurrentStepIndex() + 1} of ${FLOW_STEPS.length}`
        })}
      </Text>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 12,
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepText: {
    ...typography.body1,
    marginLeft: 8,
    flex: 1,
    color: colors.dark,
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressText: {
    ...typography.caption,
    color: colors.medium,
    textAlign: 'center',
  },
});

export default FlowStepIndicator; 