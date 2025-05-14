// components/ProblemDiagnosisDisplay.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Surface, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Problem, Diagnosis } from '../api/chatAPI';
import { colors, typography } from '../componentsBackup/admin-dashboard/admin-dashboard-styles';

interface ProblemDiagnosisDisplayProps {
  diagnosisType: 'existing_solutions' | 'ai_diagnosis' | 'issue_matches' | 'problem_matches';
  problems?: Problem[];
  diagnosis?: Diagnosis;
  currentBusinessId: number;
  onSolutionSelect?: (problem: Problem) => void;
  onRequestMoreInfo?: () => void;
}

const ProblemDiagnosisDisplay: React.FC<ProblemDiagnosisDisplayProps> = ({
  diagnosisType,
  problems,
  diagnosis,
  currentBusinessId,
  onSolutionSelect,
  onRequestMoreInfo,
}) => {
  if (diagnosisType === 'existing_solutions') {
    if (problems && problems.length > 0) {
      return (
        <Surface style={styles.container}>
          <View style={styles.header}>
            <Icon name="magnify" size={22} color={colors.primary} style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Similar Problems Found</Text>
          </View>
          <Divider style={styles.divider} />
          <FlatList
            data={problems}
            keyExtractor={(item) => (item.id || 0).toString()}
            renderItem={({ item }) => {
              // Determine source: if the problem's equipment exists and its businessId matches, then it's business data.
              const isBusiness = item.equipment && (item.equipment.businessId === currentBusinessId);
              
              return (
                <TouchableOpacity
                  onPress={() => onSolutionSelect && onSolutionSelect(item)}
                  style={styles.problemItem}
                >
                  <View style={styles.problemHeader}>
                    <Icon 
                      name={isBusiness ? "domain" : "earth"} 
                      size={18} 
                      color={isBusiness ? colors.success : colors.secondary} 
                      style={styles.sourceIcon} 
                    />
                    <Text style={styles.problemTitle}>{item.description}</Text>
                  </View>
                  
                  {/* If solutions exist for this problem, display a brief summary */}
                  {item.solutions && item.solutions.length > 0 && (
                    <View style={styles.solutionPreview}>
                      <Text style={styles.solutionPreviewLabel}>Solution:</Text>
                      <Text style={styles.solutionPreviewText}>
                        {item.solutions[0].treatment.substring(0, 80)}
                        {item.solutions[0].treatment.length > 80 ? '...' : ''}
                      </Text>
                      <Text style={styles.solutionMeta}>
                        Resolved by {item.solutions[0].resolvedBy}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </Surface>
      );
    } else {
      return (
        <Surface style={styles.container}>
          <View style={styles.emptyContainer}>
            <Icon name="help-circle-outline" size={40} color={colors.medium} style={styles.emptyIcon} />
            <Text style={styles.emptyText}>
              Can you please be more specific with your problem description?
            </Text>
            {onRequestMoreInfo && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onRequestMoreInfo}
              >
                <Text style={styles.actionButtonText}>Provide More Details</Text>
              </TouchableOpacity>
            )}
          </View>
        </Surface>
      );
    }
  } else if (diagnosisType === 'ai_diagnosis' && diagnosis) {
    return (
      <Surface style={styles.container}>
        <View style={styles.header}>
          <Icon name="robot" size={22} color={colors.primary} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>AI Diagnosis</Text>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.diagnosisContent}>
          <View style={styles.diagnosisItem}>
            <Text style={styles.diagnosisLabel}>Possible Causes:</Text>
            <Text style={styles.diagnosisValue}>{diagnosis.possibleCauses.join(', ')}</Text>
          </View>
          
          <View style={styles.diagnosisItem}>
            <Text style={styles.diagnosisLabel}>Estimated Cost:</Text>
            <Text style={styles.diagnosisValue}>{diagnosis.estimatedCost}</Text>
          </View>
          
          <View style={styles.diagnosisItem}>
            <Text style={styles.diagnosisLabel}>Parts Needed:</Text>
            <Text style={styles.diagnosisValue}>{diagnosis.partsNeeded.join(', ')}</Text>
          </View>
          
          <View style={styles.diagnosisItem}>
            <View style={styles.confidenceContainer}>
              <Text style={styles.diagnosisLabel}>Confidence:</Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>{diagnosis.diagnosisConfidence}%</Text>
              </View>
            </View>
          </View>
        </View>
      </Surface>
    );
  }
  return null;
};

const styles = StyleSheet.create({
  container: {
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
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
  },
  problemItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  problemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sourceIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  problemTitle: {
    ...typography.body1,
    color: colors.dark,
    flex: 1,
  },
  solutionPreview: {
    marginLeft: 26,
    marginTop: 4,
  },
  solutionPreviewLabel: {
    ...typography.caption,
    color: colors.dark,
    fontWeight: '600',
    marginBottom: 4,
  },
  solutionPreviewText: {
    ...typography.body2,
    color: colors.medium,
    marginBottom: 4,
  },
  solutionMeta: {
    ...typography.caption,
    color: colors.medium,
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    ...typography.body1,
    color: colors.dark,
    textAlign: 'center',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    ...typography.button,
    color: colors.white,
  },
  diagnosisContent: {
    padding: 16,
  },
  diagnosisItem: {
    marginBottom: 12,
  },
  diagnosisLabel: {
    ...typography.body2,
    color: colors.medium,
    fontWeight: '600',
    marginBottom: 4,
  },
  diagnosisValue: {
    ...typography.body1,
    color: colors.dark,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceBadge: {
    backgroundColor: colors.success + '20',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  confidenceText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
});

export default ProblemDiagnosisDisplay;
