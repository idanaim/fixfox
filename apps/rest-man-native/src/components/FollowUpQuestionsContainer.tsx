import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { QuestionAnswer, useFollowUpQuestions } from '../hooks/useFollowUpQuestions';
import FollowUpQuestions from './FollowUpQuestions';
import { Equipment } from '../api/chatAPI';
import { colors, typography } from '../componentsBackup/admin-dashboard/admin-dashboard-styles';
import { useTranslation } from 'react-i18next';

interface FollowUpQuestionsContainerProps {
  sessionId: number | null;
  equipment: Equipment | null;
  onReadyForDiagnosis: (summary: string, isFinish:boolean) => void;
  onImproveDescription: (questionsAnswered: QuestionAnswer[]) => Promise<void>;
}

const FollowUpQuestionsContainer: React.FC<FollowUpQuestionsContainerProps> = ({
  sessionId,
  equipment,
  onReadyForDiagnosis,
  onImproveDescription,
}) => {
  const { t } = useTranslation();
  const hasTriggeredImprovement = useRef(false);

  const {
    currentQuestion,
    isLoading,
    isError,
    error,
    summary,
    isReadyForDiagnosis,
    recordAnswer,
    submitAllAnswers,
    isSubmitting,
    hasQuestions,
    progress,
    answers
  } = useFollowUpQuestions({
    sessionId,
    equipment,
  });

  // When diagnosis is ready, notify parent component and trigger improvement once
  useEffect(() => {
    if (summary && !hasTriggeredImprovement.current) {
      console.log('Summary ready:', summary);
      onReadyForDiagnosis(summary , isReadyForDiagnosis);
      onImproveDescription(answers);
      hasTriggeredImprovement.current = true;
    }
  }, [summary, onReadyForDiagnosis, answers, onImproveDescription]);

  // Handle answer selection
  const handleAnswer = (answer: string, questionType?: string) => {
    if (questionType) {
      recordAnswer(answer, questionType);
    }
  };

  // Submit all answers to the backend
  const handleSubmitAllAnswers = () => {
    submitAllAnswers();
  };

  // Call improve description instead of direct diagnosis
  const handleImproveDescription = () => {
    // First submit the answers to ensure they're saved
    submitAllAnswers();
    // Then call the parent's onImproveDescription
    onImproveDescription(answers);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error?.message || 'Failed to load questions'}</Text>
      </View>
    );
  }

  if (!hasQuestions) {
    return null;
  }

  // Return null if all questions are answered
  if (isReadyForDiagnosis) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress.percentage}%` }]} />
        <Text style={styles.progressText}>
          Question {progress.current} of {progress.total}
        </Text>
      </View>

      {isSubmitting && (
        <View style={styles.submittingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.submittingText}>Processing your answers...</Text>
        </View>
      )}

      {currentQuestion && (
        <FollowUpQuestions
          questions={[currentQuestion]}
          onAnswer={handleAnswer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginBottom: 2,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: 10,
    ...typography.body1,
    color: colors.dark,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: colors.white,
  },
  errorText: {
    color: colors.error,
    ...typography.body1,
  },
  progressContainer: {
    padding: 8,
    backgroundColor: colors.lightGray,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressText: {
    ...typography.caption,
    color: colors.dark,
    textAlign: 'center',
  },
  submittingContainer: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  submittingText: {
    marginTop: 5,
    ...typography.body2,
    color: colors.dark,
  },
  summaryContainer: {
    padding: 16,
    backgroundColor: colors.white,
  },
  summaryTitle: {
    ...typography.h3,
    color: colors.dark,
    marginBottom: 8,
  },
  summaryText: {
    ...typography.body1,
    color: colors.dark,
    marginBottom: 16,
  },
  answersList: {
    marginBottom: 16,
  },
  answersHeader: {
    ...typography.body1,
    color: colors.dark,
    marginBottom: 8,
  },
  answerItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  questionText: {
    ...typography.body1,
    color: colors.dark,
    marginRight: 8,
  },
  answerText: {
    ...typography.body1,
    color: colors.dark,
  },
  buttonsContainer: {
    marginTop: 16,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.border,
  },
  improveButton: {
    backgroundColor: colors.primary,
    marginBottom: 12,
  },
  submitButtonText: {
    ...typography.button,
    color: colors.dark,
  },
  improveButtonText: {
    ...typography.button,
    color: colors.white,
  }
});

export default FollowUpQuestionsContainer;
