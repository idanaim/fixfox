import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import useSaveEmployee from '../../queries/use-save-employee';
export const AddEmployeeForm = ({ businessId }) => {
  const { mutate } = useSaveEmployee();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState('');

  const handleSubmit = () => {
    mutate({ name, email, role, businessId });
  };

  return (
    <View>
      <TextInput
        placeholder="Employee Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Employee Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Employee Role"
        value={role}
        onChangeText={setRole}
      />
      <TouchableOpacity onPress={handleSubmit}>
        <Text>Add Employee</Text>
      </TouchableOpacity>
    </View>
  );
};
