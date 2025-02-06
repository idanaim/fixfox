import { ActivityIndicator, FlatList, TouchableOpacity, View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { stylesDashboard } from './rest-man-admin-dashboard';
import { useEmployees } from '../../queries/react-query-wrapper/use-get-business';

const renderEmployee = ({ item }) => (
  <View style={stylesDashboard.employeeRow}>
    <Text style={stylesDashboard.employeeText}>{item.name}</Text>
    <Text style={stylesDashboard.employeeText}>{item.role}</Text>
    <Text style={stylesDashboard.employeeText}>{item.status}</Text>
    <View style={stylesDashboard.actionIcons}>
      <TouchableOpacity style={stylesDashboard.iconButton}>
        <MaterialIcons name="edit" size={24} color="blue" />
      </TouchableOpacity>
      <TouchableOpacity style={stylesDashboard.iconButton}>
        <MaterialIcons name="delete" size={24} color="red" />
      </TouchableOpacity>
    </View>
  </View>
);

export const EmployeeList = ({ businessId }) => {
  const { data: employees, isLoading, isError } = useEmployees(businessId);

  if (isLoading) {
    return <ActivityIndicator size="small" color="#6200ee" />;
  }

  if (isError) {
    return <Text>Error loading employees</Text>;
  }

  return (
    <FlatList
      data={employees}
      renderItem={renderEmployee}
      keyExtractor={(item) => item.id}
      style={stylesDashboard.employeeList}
    />
  );
};
