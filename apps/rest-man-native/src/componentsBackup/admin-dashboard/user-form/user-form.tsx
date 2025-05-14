import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {
  Appbar,
  List,
  Switch,
  useTheme,
  Menu,
  Button,
  Chip,
  TextInput,
  Surface,
  Divider,
  IconButton,
} from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePermissions } from '../../../queries/use-permissions';
import { colors, typography, styles as globalStyles } from '../admin-dashboard-styles';
import { useUpdateUser, useAddUser } from '../../../queries/react-query-wrapper/use-users';
import { useQueryClient } from '@tanstack/react-query';
import { useDepartments } from '../../../queries/react-query-wrapper/use-departments';
import authStore from '../../../store/auth.store';

const { width, height } = Dimensions.get('window');
const ROLES = ['General Manager', 'Team Player'];

const UserForm = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const route = useRoute();
  const { user: admin } = authStore();
  const { user, adminId } = route.params || {};
  const { updatePermissions, permissions } = usePermissions(user?.id);
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser(user?.id);
  const { mutate: addNewUser } = useAddUser(admin?.accountId);
  const [menuVisible, setMenuVisible] = useState(false);
  const [deptMenuVisible, setDeptMenuVisible] = useState(false);
  const { data: departments = [], isLoading: deptsLoading } = useDepartments();
  const [multiDeptMenuVisible, setMultiDeptMenuVisible] = useState(false);

  const { control, handleSubmit, setValue, reset, watch } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: user?.password || '',
      role: user?.role || '',
      mobile: user?.mobile || '',
      department: user?.department || '',
      departments: user?.departments || [],
      positionTitle: user?.positionTitle || '',
    },
  });

  const selectedDepartments = watch('departments') || [];

  const getDepartmentLabel = (deptValue) => {
    if (!departments || !deptValue) return '';
    const dept = departments.find(d => d.value === deptValue);
    return dept ? dept.label : deptValue;
  };

  const handleDeleteEmployee = (employeeId) => {
    Alert.alert(
      'Delete Employee',
      'Are you sure you want to delete this employee?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => console.log('delete') }, //deleteEmployee(employeeId) },
      ]
    );
  };

  const toggleDepartment = (deptValue) => {
    const currentDepts = [...(watch('departments') || [])];
    if (currentDepts.includes(deptValue)) {
      setValue('departments', currentDepts.filter(d => d !== deptValue));
    } else {
      setValue('departments', [...currentDepts, deptValue]);
    }
  };

  // Sync the form once permissions are fetched
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        password: user.password || '',
        role: user.role || '',
        mobile: user.mobile || '',
        department: user.department || '',
        departments: user.departments || [],
        positionTitle: user.positionTitle || '',
      });
    }
  }, [permissions, reset]);

  const onSubmit = (data) => {
    if(user?.id){
      updateUser(data, {
        onSuccess: () => {
          queryClient.invalidateQueries(['users', adminId]);
          navigation.goBack();
          Alert.alert('Success', 'Employee updated successfully');
        },
        onError: () => {
          Alert.alert('Error', 'Failed to update employee');
        },
      });
    } else {
      addNewUser(data, {
        onSuccess: () => {
          queryClient.invalidateQueries(['users', adminId]);
          Alert.alert('Success', 'Employee added successfully');
          navigation.goBack();
        },
        onError: () => {
          Alert.alert('Error', 'Failed to add employee');
        },
      });
    }
  };

  const headerTitle = user?.name ? `${user.name} Details` : 'New User';

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <Appbar.Header style={styles.appbarHeader}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={headerTitle} titleStyle={styles.headerTitle} />
        {user?.id && (
          <Appbar.Action
            icon="delete"
            onPress={() => handleDeleteEmployee(user.id)}
            color={colors.error}
          />
        )}
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <Surface style={styles.contentContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      mode="outlined"
                      placeholder="Enter full name"
                      style={styles.input}
                      outlineColor={colors.border}
                      activeOutlineColor={colors.primary}
                      left={<TextInput.Icon icon="account" color={colors.medium} />}
                    />
                  )}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      mode="outlined"
                      placeholder="Enter email address"
                      style={styles.input}
                      outlineColor={colors.border}
                      activeOutlineColor={colors.primary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      left={<TextInput.Icon icon="email" color={colors.medium} />}
                    />
                  )}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{user?.id ? 'Update Password' : 'Password *'}</Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      mode="outlined"
                      placeholder={user?.id ? "Leave blank to keep current" : "Enter password"}
                      style={styles.input}
                      outlineColor={colors.border}
                      activeOutlineColor={colors.primary}
                      secureTextEntry
                      left={<TextInput.Icon icon="lock" color={colors.medium} />}
                    />
                  )}
                />
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Role & Department</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Role *</Text>
                <Controller
                  control={control}
                  name="role"
                  render={({ field: { value, onChange } }) => (
                    <Menu
                      visible={menuVisible}
                      onDismiss={() => setMenuVisible(false)}
                      anchor={
                        <TouchableOpacity
                          onPress={() => setMenuVisible(true)}
                          style={styles.dropdownButton}
                        >
                          <Icon name="badge-account" size={20} color={colors.medium} style={styles.dropdownIcon} />
                          <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
                            {value || 'Select Role'}
                          </Text>
                          <Icon name="chevron-down" size={20} color={colors.medium} />
                        </TouchableOpacity>
                      }
                      contentStyle={styles.menuContent}
                    >
                      {ROLES.map((role) => (
                        <Menu.Item
                          key={role}
                          onPress={() => {
                            onChange(role);
                            setMenuVisible(false);
                          }}
                          title={role}
                          titleStyle={styles.menuItemTitle}
                          style={styles.menuItem}
                        />
                      ))}
                    </Menu>
                  )}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Primary Department</Text>
                <Controller
                  control={control}
                  name="department"
                  render={({ field: { value, onChange } }) => (
                    deptsLoading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={colors.primary} />
                      </View>
                    ) : (
                      <Menu
                        visible={deptMenuVisible}
                        onDismiss={() => setDeptMenuVisible(false)}
                        anchor={
                          <TouchableOpacity
                            onPress={() => setDeptMenuVisible(true)}
                            style={styles.dropdownButton}
                          >
                            <Icon name="domain" size={20} color={colors.medium} style={styles.dropdownIcon} />
                            <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
                              {value ? getDepartmentLabel(value) : 'Select Primary Department'}
                            </Text>
                            <Icon name="chevron-down" size={20} color={colors.medium} />
                          </TouchableOpacity>
                        }
                        contentStyle={styles.menuContent}
                      >
                        {departments.map((dept) => (
                          <Menu.Item
                            key={dept.value}
                            onPress={() => {
                              onChange(dept.value);
                              setDeptMenuVisible(false);
                            }}
                            title={dept.label}
                            titleStyle={styles.menuItemTitle}
                            style={styles.menuItem}
                          />
                        ))}
                      </Menu>
                    )
                  )}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Additional Departments</Text>
                <View style={styles.chipContainer}>
                  {selectedDepartments.map(deptValue => (
                    <Chip
                      key={deptValue}
                      onClose={() => toggleDepartment(deptValue)}
                      style={styles.chip}
                      textStyle={styles.chipText}
                      closeIconAccessibilityLabel="Remove department"
                    >
                      {getDepartmentLabel(deptValue)}
                    </Chip>
                  ))}
                </View>

                {deptsLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : (
                  <Menu
                    visible={multiDeptMenuVisible}
                    onDismiss={() => setMultiDeptMenuVisible(false)}
                    anchor={
                      <Button
                        mode="outlined"
                        onPress={() => setMultiDeptMenuVisible(true)}
                        style={styles.addDeptButton}
                        icon="plus"
                      >
                        Add Department
                      </Button>
                    }
                    contentStyle={styles.menuContent}
                  >
                    {departments
                      .filter(dept => !selectedDepartments.includes(dept.value))
                      .map((dept) => (
                        <Menu.Item
                          key={dept.value}
                          onPress={() => {
                            toggleDepartment(dept.value);
                            setMultiDeptMenuVisible(false);
                          }}
                          title={dept.label}
                          titleStyle={styles.menuItemTitle}
                          style={styles.menuItem}
                        />
                      ))}
                  </Menu>
                )}
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Additional Details</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Position Title</Text>
                <Controller
                  control={control}
                  name="positionTitle"
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      mode="outlined"
                      placeholder="Enter position title"
                      style={styles.input}
                      outlineColor={colors.border}
                      activeOutlineColor={colors.primary}
                      left={<TextInput.Icon icon="briefcase" color={colors.medium} />}
                    />
                  )}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <Controller
                  control={control}
                  name="mobile"
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      mode="outlined"
                      placeholder="Enter phone number"
                      style={styles.input}
                      outlineColor={colors.border}
                      activeOutlineColor={colors.primary}
                      keyboardType="phone-pad"
                      left={<TextInput.Icon icon="phone" color={colors.medium} />}
                    />
                  )}
                />
              </View>
            </View>
          </ScrollView>
        </Surface>

        <Surface style={styles.formActions}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            labelStyle={styles.cancelButtonText}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.saveButton}
            labelStyle={styles.saveButtonText}
            loading={isUpdating}
            disabled={isUpdating}
          >
            {user?.id ? 'Update User' : 'Create User'}
          </Button>
        </Surface>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  appbarHeader: {
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.dark,
  },
  contentContainer: {
    flex: 1,
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  scrollContent: {
    padding: 16,
  },
  formSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.dark,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    ...typography.body2,
    color: colors.medium,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.white,
    fontSize: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 14,
    backgroundColor: colors.white,
  },
  dropdownText: {
    flex: 1,
    ...typography.body1,
    color: colors.dark,
  },
  placeholderText: {
    color: colors.medium,
  },
  dropdownIcon: {
    marginRight: 10,
  },
  menuContent: {
    backgroundColor: colors.white,
    borderRadius: 8,
    marginTop: 8,
    minWidth: 200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  menuItem: {
    height: 48,
  },
  menuItemTitle: {
    ...typography.body1,
    color: colors.dark,
  },
  loadingContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    margin: 4,
    backgroundColor: colors.lightGray,
  },
  chipText: {
    ...typography.caption,
    color: colors.dark,
  },
  addDeptButton: {
    marginTop: 8,
    borderColor: colors.border,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: colors.border,
    height: 1,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.dark,
  },
  saveButton: {
    flex: 2,
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.white,
  },
});

export default UserForm;
