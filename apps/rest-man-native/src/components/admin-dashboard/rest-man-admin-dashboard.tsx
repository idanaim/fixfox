import React from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useBusinesses, useUserById, useUsersByAdmin } from '../../queries/react-query-wrapper/use-get-business';

export default function UsersManagement() {
  const { data: bussiness } = useBusinesses(1);
 const{data:employees}= useUsersByAdmin(1);
 const{data:admin = {}}= useUserById(1);
  const renderEmployee = ({ item }) => (
    <View style={styles.employeeRow}>
      <Text style={styles.employeeText}>{item.name}</Text>
      <Text style={styles.employeeText}>{item.role}</Text>
      <Text style={styles.employeeText}>{item.email}</Text>
      <View style={styles.actionIcons}>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="edit" size={24} color="blue" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Admin</Text>
        <Text style={styles.label}>Name: {admin.name}</Text>
        <Text style={styles.label}>Mobile: {admin.mobile}</Text>
        <Text style={styles.label}>Email: {admin.email}</Text>
      </View>

      {bussiness?.map((bus) => (
        <View style={styles.sectionCard} key={bus.id}>
          <Text style={styles.sectionTitle}>Business Overview</Text>
          <Text style={styles.label}> Name: {bus.name}</Text>
          <Text style={styles.label}> ID: {bus.id}</Text>
          <Text style={styles.label}> Phone: {bus.mobile}</Text>
          <Text style={styles.label}> Address: {bus.address}</Text>
          <Text style={styles.label}> Type: {bus.type}</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Copy Link</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Generate QR Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Employee Management Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Employee Management</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Add Employee</Text>
        </TouchableOpacity>
        <FlatList
          data={employees}
          renderItem={renderEmployee}
          keyExtractor={(item) => item.id}
          style={styles.employeeList}
        />
      </View>

      {/* Settings Section */}
      {/*<View style={styles.sectionCard}>*/}
      {/*  <Text style={styles.sectionTitle}>Business Settings</Text>*/}
      {/*  <Text style={styles.label}>Edit Business Information:</Text>*/}
      {/*  <TextInput style={styles.input} placeholder="Business Name" />*/}
      {/*  <TextInput style={styles.input} placeholder="Business Address" />*/}
      {/*  <TouchableOpacity style={styles.saveButton}>*/}
      {/*    <Text style={styles.saveButtonText}>Save</Text>*/}
      {/*  </TouchableOpacity>*/}
      {/*</View>*/}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  sectionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#03dac5',
    paddingVertical: 10,
    borderRadius: 4,
    marginBottom: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  employeeList: {
    marginTop: 8,
  },
  employeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  employeeText: {
    fontSize: 14,
    color: '#333',
  },
  actionIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
