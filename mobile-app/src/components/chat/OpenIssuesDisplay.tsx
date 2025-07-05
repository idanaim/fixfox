import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography } from '../admin-dashboard/admin-dashboard-styles';

interface OpenIssue {
  id: number;
  problem: {
    description: string;
  };
  createdAt: string;
  status: string;
}

interface OpenIssuesDisplayProps {
  issues: OpenIssue[];
  onSelectIssue: (issue: OpenIssue) => void;
  onContinue: () => void;
}

const OpenIssuesDisplay: React.FC<OpenIssuesDisplayProps> = ({
  issues,
  onSelectIssue,
  onContinue,
}) => {
  const { t } = useTranslation();

  if (!issues || issues.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('chat.open_issues_found')}</Text>
      <Text style={styles.subtitle}>
        {t('chat.open_issues_description')}
      </Text>
      <ScrollView style={styles.issuesList}>
        {issues
          .filter(issue => issue && issue.problem)
          .map((issue) => (
          <TouchableOpacity
            key={issue.id}
            style={styles.issueItem}
            onPress={() => onSelectIssue(issue)}
          >
            <Text style={styles.issueDescription}>
              {issue.problem.description}
            </Text>
            <Text style={styles.issueDate}>
              {new Date(issue.createdAt).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
        <Text style={styles.continueButtonText}>
          {t('common.continue_anyway')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    margin: 6,
  },
  title: {
    ...typography.h3,
    fontSize: 18,
    color: colors.dark,
    marginBottom: 6,
  },
  subtitle: {
    ...typography.body2,
    color: colors.medium,
    marginBottom: 12,
  },
  issuesList: {
    maxHeight: 180,
  },
  issueItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    marginBottom: 6,
  },
  issueDescription: {
    ...typography.body2,
    color: colors.dark,
    marginBottom: 4,
  },
  issueDate: {
    ...typography.caption,
    color: colors.medium,
  },
  continueButton: {
    marginTop: 12,
    padding: 10,
    backgroundColor: colors.lightGray,
    borderRadius: 6,
    alignItems: 'center',
  },
  continueButtonText: {
    ...typography.button,
    color: colors.dark,
  },
});

export default OpenIssuesDisplay; 