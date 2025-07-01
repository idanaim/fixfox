import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { colors } from '../admin-dashboard/admin-dashboard-styles';

interface ConfirmationDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={onConfirm}
        style={styles.confirmButton}
        labelStyle={styles.buttonLabel}
      >
        {t('common.confirm')}
      </Button>
      <Button
        mode="outlined"
        onPress={onCancel}
        style={styles.cancelButton}
        labelStyle={styles.buttonLabel}
      >
        {t('common.cancel')}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    marginBottom: 8,
    gap: 8,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    borderColor: colors.primary,
  },
  buttonLabel: {
    fontSize: 14,
  },
});

export default ConfirmationDialog; 