import React, { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Appbar, List, Switch, useTheme, Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { usePermissions } from '../../queries/use-permissions';

const PermissionsManagementScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const {user}=route?.params
  const { updatePermissions, permissions } = usePermissions(user.id);

  const { control, handleSubmit, setValue, reset } = useForm({
    defaultValues: {
      createTicket: permissions?.createTicket || false,
      readTicket: permissions?.readTicket || false,
      updateTicket: permissions?.updateTicket || false,
      deleteTicket: permissions?.deleteTicket || false,
      manageUsers: permissions?.manageUsers || false,
    },
  });
  // Sync the form once permissions are fetched
  useEffect(() => {
    if (permissions) {
      reset({
        createTicket: permissions.createTicket || false,
        readTicket: permissions.readTicket || false,
        updateTicket: permissions.updateTicket || false,
        deleteTicket: permissions.deleteTicket || false,
        manageUsers: permissions.manageUsers || false,
      });
    }
  }, [permissions, reset]);
  const onSubmit = (data) => {
    console.log('Updated Permissions:', data);
    updatePermissions.mutate(data);
  };

  return (
    <>
      <Appbar.Header theme={{ colors: { primary: theme.colors.primary } }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`${user.name} Permissions`} />
      </Appbar.Header>

      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
      >
        {['createTicket', 'readTicket', 'updateTicket', 'deleteTicket', 'manageUsers'].map((permission) => (
          <Controller
            key={permission}
            control={control}
            name={permission}
            render={({ field: { value, onChange } }) => (
              <List.Item
                title={permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                left={() => <List.Icon icon={getPermissionIcon(permission)} />}
                right={() => (
                  <Switch
                    value={value}
                    onValueChange={(newValue) => {
                      onChange(newValue);
                      setValue(permission, newValue);
                    }}
                  />
                )}
              />
            )}
          />
        ))}

        <Button
          mode="contained"
          style={styles.saveButton}
          onPress={handleSubmit(onSubmit)}
          icon="content-save"
        >
          Save Changes
        </Button>
      </ScrollView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  saveButton: {
    backgroundColor: "#6200ea",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
});

export default PermissionsManagementScreen;
