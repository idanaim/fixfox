import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors, typography } from '../../componentsBackup/admin-dashboard/admin-dashboard-styles';

interface EmptyStateDisplayProps {
  onRequestMoreInfo?: () => void;
  onGetAISolutions?: () => void;
}

const EmptyStateDisplay: React.FC<EmptyStateDisplayProps> = ({
  onRequestMoreInfo,
  onGetAISolutions,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Icon name="lightbulb-off-outline" size={48} color={colors.medium} style={styles.icon} />
      <Text style={styles.title}>{t('diagnosis.emptyState.title')}</Text>
      <Text style={styles.message}>{t('diagnosis.emptyState.message')}</Text>
      <View style={styles.buttonContainer}>
        {onGetAISolutions && (
          <Button
            mode="contained"
            onPress={onGetAISolutions}
            style={[styles.button, styles.primaryButton]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon="robot"
            compact
          >
            {t('diagnosis.getAISolutions', { defaultValue: 'Get AI Solutions' })}
          </Button>
        )}
        {onRequestMoreInfo && (
          <Button
            mode="outlined"
            onPress={onRequestMoreInfo}
            style={[styles.button, styles.secondaryButton]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.secondaryButtonLabel}
            icon="help-circle-outline"
            compact
          >
            {t('diagnosis.emptyState.action')}
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    ...typography.h3,
    color: colors.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    ...typography.body1,
    color: colors.medium,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    borderRadius: 6,
    minHeight: 36,
  },
  secondaryButton: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  buttonContainer: {
    flexDirection: 'column',
    width: '100%',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  buttonContent: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  secondaryButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
});

export default EmptyStateDisplay; 