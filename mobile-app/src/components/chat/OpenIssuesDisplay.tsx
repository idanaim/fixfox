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
        {issues.map((issue) => (
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
    padding: 16,
    borderRadius: 8,
    margin: 8,
  },
  title: {
    ...typography.h3,
    color: colors.dark,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body1,
    color: colors.medium,
    marginBottom: 16,
  },
  issuesList: {
    maxHeight: 200,
  },
  issueItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    marginBottom: 8,
  },
  issueDescription: {
    ...typography.body1,
    color: colors.dark,
    marginBottom: 4,
  },
  issueDate: {
    ...typography.caption,
    color: colors.medium,
  },
  continueButton: {
    marginTop: 16,
    padding: 12,
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