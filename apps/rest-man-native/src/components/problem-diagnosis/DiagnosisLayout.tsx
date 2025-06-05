import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Surface, Divider, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography } from '../../componentsBackup/admin-dashboard/admin-dashboard-styles';

interface DiagnosisLayoutProps {
  icon: string;
  title: string;
  children: React.ReactNode;
}

const DiagnosisLayout: React.FC<DiagnosisLayoutProps> = ({ icon, title, children }) => (
  <Surface style={styles.container}>
    <View style={styles.header}>
      <Icon name={icon} size={22} color={colors.primary} style={styles.headerIcon} />
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
    <Divider style={styles.divider} />
    {children}
  </Surface>
);

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
});

export default DiagnosisLayout; 