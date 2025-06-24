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
  I18nManager,
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
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');
const ROLES = ['General Manager', 'Team Player'];

const UserForm = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const route = useRoute();
  const { user: admin } = authStore();
  const { user, adminId } = (route.params as any) || {};
  const { updatePermissions, permissions } = usePermissions(user?.id);
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser(user?.id);
  const { mutate: addNewUser } = useAddUser(admin?.accountId || '');
  const [menuVisible, setMenuVisible] = useState(false);
  const [deptMenuVisible, setDeptMenuVisible] = useState(false);
  const { data: departments = [], isLoading: deptsLoading } = useDepartments();
  const [multiDeptMenuVisible, setMultiDeptMenuVisible] = useState(false);
  const { t, i18n } = useTranslation();

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

  const getDepartmentLabel = (deptValue: string) => {
    if (!departments || !deptValue) return '';
    const dept = departments.find((d: any) => d.value === deptValue);
    return dept ? dept.label : deptValue;
  };

  const handleDeleteEmployee = (employeeId: string | number) => {
    Alert.alert(
      t('admin.userForm.deleteTitle'),
      t('admin.userForm.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), onPress: () => console.log('delete') }, //deleteEmployee(employeeId) },
      ]
    );
  };

  const toggleDepartment = (deptValue: string) => {
    const currentDepts = [...(watch('departments') || [])];
    if (currentDepts.includes(deptValue)) {
      setValue('departments', currentDepts.filter((d: string) => d !== deptValue));
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

  const onSubmit = (data: any) => {
    if(user?.id){
      updateUser(data, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['users', adminId] });
          navigation.goBack();
          Alert.alert('Success', t('admin.userForm.successUpdate'));
        },
        onError: () => {
          Alert.alert('Error', t('admin.userForm.errorUpdate'));
        },
      });
    } else {
      addNewUser(data, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['users', adminId] });
          Alert.alert('Success', t('admin.userForm.successAdd'));
          navigation.goBack();
        },
        onError: () => {
          Alert.alert('Error', t('admin.userForm.errorAdd'));
        },
      });
    }
  };

  const headerTitle = user?.name 
    ? t('admin.userForm.editTitle', { name: user.name })
    : t('admin.userForm.title');

  return (
    <SafeAreaView style={[styles.safeAreaContainer, { direction: i18n.language === 'he' ? 'rtl' : 'ltr' }]}>
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
              <Text style={styles.sectionTitle}>{t('admin.userForm.basicInfo')}</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('admin.userForm.fullName')} *</Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      mode="outlined"
                      placeholder={t('admin.userForm.enterFullName')}
                      style={styles.input}
                      outlineColor={colors.border}
                      activeOutlineColor={colors.primary}
                      left={<TextInput.Icon icon="account" color={colors.medium} />}
                      textAlign={i18n.language === 'he' ? 'right' : 'left'}
                    />
                  )}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('admin.userForm.emailAddress')} *</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      mode="outlined"
                      placeholder={t('admin.userForm.enterEmail')}
                      style={styles.input}
                      outlineColor={colors.border}
                      activeOutlineColor={colors.primary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      left={<TextInput.Icon icon="email" color={colors.medium} />}
                      textAlign={i18n.language === 'he' ? 'right' : 'left'}
                    />
                  )}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {user?.id ? t('admin.userForm.updatePassword') : t('admin.userForm.newPassword')} *
                </Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      mode="outlined"
                      placeholder={user?.id ? t('admin.userForm.keepCurrent') : t('admin.userForm.enterPassword')}
                      style={styles.input}
                      outlineColor={colors.border}
                      activeOutlineColor={colors.primary}
                      secureTextEntry
                      left={<TextInput.Icon icon="lock" color={colors.medium} />}
                      textAlign={i18n.language === 'he' ? 'right' : 'left'}
                    />
                  )}
                />
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>{t('admin.userForm.roleDepartment')}</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('admin.userForm.role')} *</Text>
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
                          <Text style={styles.dropdownButtonText}>
                            {value || t('admin.userForm.selectRole')}
                          </Text>
                          <Icon name="chevron-down" size={24} color={colors.medium} />
                        </TouchableOpacity>
                      }
                    >
                      {ROLES.map((role) => (
                        <Menu.Item
                          key={role}
                          onPress={() => {
                            onChange(role);
                            setMenuVisible(false);
                          }}
                          title={role}
                        />
                      ))}
                    </Menu>
                  )}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('admin.userForm.departments')}</Text>
                <Controller
                  control={control}
                  name="departments"
                  render={({ field: { value, onChange } }) => (
                    <View style={styles.departmentsContainer}>
                      {selectedDepartments.map((dept: string) => (
                        <Chip
                          key={dept}
                          onClose={() => toggleDepartment(dept)}
                          style={styles.departmentChip}
                        >
                          {getDepartmentLabel(dept)}
                        </Chip>
                      ))}
                      <TouchableOpacity
                        onPress={() => setMultiDeptMenuVisible(true)}
                        style={styles.addDepartmentButton}
                      >
                        <Icon name="plus" size={20} color={colors.primary} />
                        <Text style={styles.addDepartmentText}>{t('admin.userForm.selectDepartment')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('admin.userForm.positionTitle')}</Text>
                <Controller
                  control={control}
                  name="positionTitle"
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      mode="outlined"
                      placeholder={t('admin.userForm.enterPosition')}
                      style={styles.input}
                      outlineColor={colors.border}
                      activeOutlineColor={colors.primary}
                      textAlign={i18n.language === 'he' ? 'right' : 'left'}
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
            {t('common.cancel')}
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.saveButton}
            labelStyle={styles.saveButtonText}
            loading={isUpdating}
            disabled={isUpdating}
          >
            {user?.id ? t('common.update') : t('common.create')}
          </Button>
        </Surface>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appbarHeader: {
    backgroundColor: colors.primary,
  },
  headerTitle: {
    ...typography.h6,
    color: colors.white,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 8,
    elevation: 2,
  },
  scrollContent: {
    padding: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.h6,
    color: colors.dark,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    ...typography.body2,
    color: colors.dark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
  },
  divider: {
    marginVertical: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 12,
    backgroundColor: colors.white,
  },
  dropdownButtonText: {
    ...typography.body1,
    color: colors.dark,
  },
  departmentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  departmentChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  addDepartmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  addDepartmentText: {
    ...typography.body2,
    color: colors.primary,
    marginLeft: 4,
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
