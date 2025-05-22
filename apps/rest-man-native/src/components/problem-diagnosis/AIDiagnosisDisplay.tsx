import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Diagnosis } from '../../api/chatAPI';
import { colors, typography } from '../../componentsBackup/admin-dashboard/admin-dashboard-styles';

interface AIDiagnosisDisplayProps {
  diagnosis: Diagnosis;
}

const AIDiagnosisDisplay: React.FC<AIDiagnosisDisplayProps> = ({ diagnosis }) => (
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
);

const styles = StyleSheet.create({
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

export default AIDiagnosisDisplay; 