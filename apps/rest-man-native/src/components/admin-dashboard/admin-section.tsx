import React from 'react';
import { View, Text } from 'react-native';
import { useUserById } from '../../queries/react-query-wrapper/use-users';
import { styles } from './admin-dashboard-styles';
export function AdminSection() {
  const { data: admin = {} } = useUserById(6);

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Admin</Text>
      <Text style={styles.label}>Name: {admin.name}</Text>
      <Text style={styles.label}>Mobile: {admin.mobile}</Text>
      <Text style={styles.label}>Email: {admin.email}</Text>
    </View>
  );
}
