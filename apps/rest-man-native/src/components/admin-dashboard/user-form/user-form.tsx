import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Appbar, List, Switch, useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import { usePermissions } from '../../../queries/use-permissions';
import { styles } from '../admin-dashboard-styles';
import { useUpdateUser, useAddUser } from '../../../queries/react-query-wrapper/use-users';
import { useQueryClient } from '@tanstack/react-query';

const UserForm = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const route = useRoute();
  const { user, adminId } = route.params;
  const { updatePermissions, permissions } = usePermissions(user?.id);
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser(user?.id);
  const { mutate: addNewUser } = useAddUser(adminId);
  const { control, handleSubmit, setValue, reset } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: user?.password || '',
      role: user?.role || '',
      mobile: user?.mobile || '',
      permissions: {
        createTicket: permissions?.createTicket || false,
        readTicket: permissions?.readTicket || false,
        updateTicket: permissions?.updateTicket || false,
        deleteTicket: permissions?.deleteTicket || false,
        manageUsers: permissions?.manageUsers || false,
      },
    },
  });

  const handleDeleteEmployee = (employeeId: number) => {
    Alert.alert(
      'Delete Employee',
      'Are you sure you want to delete this employee?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => console.log('delete') }, //deleteEmployee(employeeId) },
      ]
    );
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
        permissions: {
          createTicket: permissions?.createTicket || false,
          readTicket: permissions?.readTicket || false,
          updateTicket: permissions?.updateTicket || false,
          deleteTicket: permissions?.deleteTicket || false,
          manageUsers: permissions?.manageUsers || false,
        },
      });
    }
  }, [permissions, reset]);

  const onSubmit = (data) => {
  if(user?.id){
    updateUser(data, {
      onSuccess: () => {
        queryClient.invalidateQueries(['users', adminId]).then();
        navigation.goBack();
        Alert.alert('Success', 'Employee updated successfully');
        // setEmployeeForm({ name: '', email: '', role: '', mobile: '', businessId });
      },
      onError: () => {
        Alert.alert('Error', 'Failed to update employee');
      },
    });
  } else {
    addNewUser(data, {
      onSuccess: () => {
        queryClient.invalidateQueries(['users', adminId]).then();
        Alert.alert('Success', 'Employee added successfully');
        navigation.goBack();
        // setEmployeeForm(InitUser);
      },
      onError: () => {
        Alert.alert('Error', 'Failed to add employee');
      },
    })
  }
  };

  const headerTitle =user?.name? `${user.name} Details`: 'New User';
  return (
    <>
      <Appbar.Header theme={{ colors: { primary: theme.colors.primary } }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={headerTitle} />
      </Appbar.Header>

      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
      >
        <View style={styles.modalContent}>
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange } }) => (
              <TextInput
                onChangeText={onChange}
                style={styles.input}
                placeholder="Full Name"
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange } }) => (
              <TextInput
                onChangeText={onChange}
                style={styles.input}
                placeholder="Email"
                value={value}
                keyboardType="email-address"
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange } }) => (
              <TextInput
                onChangeText={onChange}
                secureTextEntry={true}
                style={styles.input}
                placeholder="Password"
                value={value}
                keyboardType="email-address"
              />
            )}
          />
          <Controller
            control={control}
            name="role"
            render={({ field: { value, onChange } }) => (
              <TextInput
                onChange={onChange}
                style={styles.input}
                placeholder="Role"
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="mobile"
            render={({ field: { value, onChange } }) => (
              <TextInput
                onChangeText={onChange}
                style={styles.input}
                placeholder="Mobile Number"
                value={value}
                // onChangeText={(text) =>
                //   setEmployeeForm({ ...employeeForm, mobile: text })
                // }
                keyboardType="phone-pad"
              />
            )}
          />
        </View>

        {[
          'createTicket',
          'readTicket',
          'updateTicket',
          'deleteTicket',
          'manageUsers',
        ].map((permission) => (
          <Controller
            key={permission}
            control={control}
            name={`permissions.${permission}`}
            render={({ field: { value, onChange } }) => (
              <List.Item
                title={permission
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())}
                left={() => <List.Icon icon={getPermissionIcon(permission)} />}
                right={() => (
                  <Switch
                    value={value}
                    onValueChange={(newValue) => {
                      onChange(newValue);
                      setValue(`permissions.${permission}`, newValue);
                    }}
                  />
                )}
              />
            )}
          />
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSubmit(onSubmit)}
        disabled={isUpdating}
      >
        {isUpdating ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.cancelButton, styles.deleteButton]}
        onPress={() => handleDeleteEmployee(user?.id || 0)}
      >
        <Text style={styles.cancelButtonText}>Delete</Text>
      </TouchableOpacity>
      {/*<Button*/}
      {/*  mode="contained"*/}
      {/*  style={styles.saveButton}*/}
      {/*  onPress={handleSubmit(onSubmit)}*/}
      {/*  icon="content-save"*/}
      {/*>*/}
      {/*  Save Changes*/}
      {/*</Button>*/}
    </>
  );
};

const getPermissionIcon = (permission) => {
  switch (permission) {
    case 'createTicket':
      return 'plus-box';
    case 'readTicket':
      return 'eye';
    case 'updateTicket':
      return 'pencil';
    case 'deleteTicket':
      return 'delete';
    case 'manageUsers':
      return 'account-group';
    default:
      return 'checkbox-blank-circle-outline';
  }
};

export default UserForm;
