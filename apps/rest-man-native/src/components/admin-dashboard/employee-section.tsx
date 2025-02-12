import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  useUsersByAdmin,
} from '../../queries/react-query-wrapper/use-users';
import { styles } from './admin-dashboard-styles';
import { User } from '../../interfaces/business';
import { useNavigation } from '@react-navigation/native';
const tempAdminId = 22;
export function EmployeeSection({ businessId }: { businessId?: number }) {
  const { data: employees, isLoading, error } = useUsersByAdmin(tempAdminId);
  const navigation = useNavigation();

  const renderEmployee = ({ item }: { item: User }) => (
    <View style={styles.employeeCard}>
      {/* Main Content */}
      <View style={styles.employeeInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.employeeName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.employeeRole}>{item.role}</Text>
        </View>
        <Text style={styles.employeeEmail} numberOfLines={1}>
          {item.email}
        </Text>
      </View>

      {/* Action Menu */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.permissionButton]}
          onPress={() => navigation.navigate('user-form', { user: item, adminId: tempAdminId })}
        >
          <MaterialIcons name="edit" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
  if (isLoading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text>Error loading employees</Text>;

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Employee Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('permissions', {user: null,adminId: tempAdminId})}
        >
          <MaterialIcons name="person-add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.sectionCard}>
        <FlatList<User>
          data={employees}
          renderItem={renderEmployee}
          keyExtractor={(item) => item?.id?.toString() || ''}
          style={styles.employeeList}
        />
      </View>
    </View>
  );
}
