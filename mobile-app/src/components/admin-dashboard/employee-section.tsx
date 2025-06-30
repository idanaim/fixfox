import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
} from 'react-native';
import { useUsersByAdmin } from '../../queries/react-query-wrapper/use-users';
import { colors, styles } from './admin-dashboard-styles';
import { User } from '../../interfaces/business';
import { useNavigation } from '@react-navigation/native';
import useAuthStore from '../../store/auth.store';
import { useRoles } from '../../queries/react-query-wrapper/use-roles';
import { useDepartments } from '../../queries/react-query-wrapper/use-departments';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Avatar, IconButton, Surface } from 'react-native-paper';
import { useDashboardStore } from '../../store/dashboard.store';

/**
 * Displays a list of employees for the currently selected business from the dashboard store.
 * If no business is selected, shows all users in the account.
 *
 * Shows loading and error states, and provides navigation to edit user details. If no employees are found, displays an empty state messages.
 */
export function EmployeeSection() {
  const { user } = useAuthStore();
  const { selectedBusiness } = useDashboardStore();

  // Get all account users as fallback when no business is selected
  const {
    data: allAccountUsers,
    isLoading: allUsersLoading,
    error: allUsersError,
  } = useUsersByAdmin(!selectedBusiness ? user?.accountId : undefined);

  // Always use selected business employees if a business is selected
  const businessEmployees = selectedBusiness?.employees?.map((emp: any) => emp.user) || [];

  // Determine which data to use: selected business employees or all account users
  const employees = selectedBusiness ? businessEmployees : allAccountUsers;
  const isLoading = selectedBusiness ? false : allUsersLoading; // Business data comes from store
  const error = selectedBusiness ? null : allUsersError; // Business data comes from store

  // Debug logging
  console.log('EmployeeSection - selectedBusiness:', selectedBusiness?.name, selectedBusiness?.id);
  console.log('EmployeeSection - businessEmployees raw:', selectedBusiness?.employees);
  console.log('EmployeeSection - employees count:', employees?.length);
  console.log('EmployeeSection - employees:', employees?.map((e: any) => e.name));
  const navigation = useNavigation();
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: departments, isLoading: deptsLoading } = useDepartments();

  const getRoleName = (roleId: string) => {
    if (!roles) return roleId;
    const role = roles.find((r) => r.id === roleId);
    return role ? role.name : roleId;
  };

  const getDepartmentLabel = (deptValue: string) => {
    if (!departments || !deptValue) return '';
    const dept = departments.find((d) => d.value === deptValue);
    return dept ? dept.label : '';
  };

  const getAvatarLabel = (name: string): string => {
    if (!name) return '?';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    }
    return name[0];
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <Surface style={styles.listItem} key={item.id}>
      <Avatar.Text
        size={40}
        label={getAvatarLabel(item.name)}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userRole}>{getRoleName(item.role)} {item.department? '• '+ item.department:''}</Text>
        {item.departments && item.departments.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
            <Text style={[ styles.userRole,{ marginRight: 4 }]}>
              Also in:
            </Text>
            {item.departments.map((deptId, index) => (
              <Text key={deptId} style={styles.userRole}>
                {getDepartmentLabel(deptId)}
                {index < (item?.departments?.length|| 0 )  - 1 ? ', ' : ''}
              </Text>
            ))}
          </View>)}
        <Text style={styles.userRole}>{item.email}</Text>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <IconButton
          icon="pencil"
          iconColor={colors.success}
          size={20}
          onPress={() => (navigation as any).navigate('user-form', { user: item })}
          style={styles.actionButton}
        />
      </View>
    </Surface>
  );

  if (isLoading || rolesLoading || deptsLoading)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  if (error) return <Text>Error loading employees</Text>;

  if (employees?.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Icon name="account-off" size={48} color={colors.medium} style={styles.emptyStateIcon} />
        <Text style={styles.emptyStateText}>No users found</Text>
      </View>
    );
  }

  return (
        <FlatList<User>
          data={employees}
          renderItem={renderUserItem}
          keyExtractor={(item) => item?.id?.toString() || ''}
          contentContainerStyle={{ padding: 8 }}
        />
  );
}
