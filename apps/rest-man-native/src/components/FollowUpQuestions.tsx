import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { colors, typography } from '../componentsBackup/admin-dashboard/admin-dashboard-styles';
import { FollowUpQuestion } from '../api/chatAPI';

interface FollowUpQuestionsProps {
  questions: (FollowUpQuestion & { answer?: string })[];
  onAnswer: (answer: string, questionType?: string) => void;
}

const FollowUpQuestions: React.FC<FollowUpQuestionsProps> = ({
  questions,
  onAnswer,
}) => {
  const { t } = useTranslation();
  const currentQuestion = questions[0]; // Show first question

  if (!currentQuestion) return null;

  return (
    <View style={styles.container}>
      <Divider style={styles.divider} />
      <View style={styles.content}>
        <Text style={styles.question}>{currentQuestion.question}</Text>

        {currentQuestion.options && currentQuestion.options.length > 0 ? (
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  currentQuestion.answer === option && styles.selectedOption
                ]}
                onPress={() => onAnswer(option, currentQuestion.question)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginBottom: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  content: {
    padding: 16,
  },
  question: {
    ...typography.body1,
    color: colors.dark,
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    ...typography.body2,
    color: colors.dark,
  },
});

export default FollowUpQuestions;
