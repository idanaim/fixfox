import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUsersByAdmin } from '../../queries/react-query-wrapper/use-users';
import { colors, styles } from './admin-dashboard-styles';
import { User } from '../../interfaces/business';
import { useNavigation } from '@react-navigation/native';
import { useGetBusinesses } from '../../queries/react-query-wrapper/use-get-business';
import useAuthStore from '../../store/auth.store';
import { useRoles } from '../../queries/react-query-wrapper/use-roles';
import { useDepartments } from '../../queries/react-query-wrapper/use-departments';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Avatar, IconButton, Surface } from 'react-native-paper';

export function EmployeeSection({ businessId }: { businessId?: number }) {
  const { user } = useAuthStore();
  const {
    data: employees,
    isLoading,
    error,
  } = useUsersByAdmin(user?.accountId);
  const navigation = useNavigation();
  const { data: businesses } = useGetBusinesses(user?.accountId);
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
    <Surface style={styles.listItem}>
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
                {index < item?.departments?.length - 1 ? ', ' : ''}
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
          onPress={() => navigation.navigate('user-form', { user: item })}
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
