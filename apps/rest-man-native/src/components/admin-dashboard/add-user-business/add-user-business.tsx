import { MaterialIcons } from '@expo/vector-icons';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import { Business } from '../../../interfaces/business';

{
  /* Edit Employee Modal */
}

interface BusinessSectionProps {
  businesses: Business[];
}

export function AddUserBusiness({ businesses }: BusinessSectionProps) {
  return (
    <View>
      {businesses?.map((business) => (
        <View style={styles.sectionCard} key={business.id}>
          <View style={styles.businessHeader}>
            <Text style={styles.sectionTitle}>{business.name}</Text>
            <View style={styles.businessActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  setSelectedBusiness(business);
                  setAddEmployeeModalVisible(true);
                }}
              >
                <MaterialIcons name="person-add" size={24} color="green" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => console.log('delete', item.id)} //deleteBusiness(business.id)}
              >
                <MaterialIcons name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.label}>ID: {business.id}</Text>
          <Text style={styles.label}>Phone: {business.mobile}</Text>
          <Text style={styles.label}>Address: {business.address}</Text>
          <Text style={styles.label}>Type: {business.type}</Text>
        </View>
      ))}


      {/* Add Employee Modal */}
      <Modal
        visible={isAddEmployeeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddEmployeeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Employee</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={employeeForm.name}
              onChangeText={(text) => setEmployeeForm({ ...employeeForm, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={employeeForm.email}
              onChangeText={(text) => setEmployeeForm({ ...employeeForm, email: text })}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Role"
              value={employeeForm.role}
              onChangeText={(text) => setEmployeeForm({ ...employeeForm, role: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              value={employeeForm.mobile}
              onChangeText={(text) => setEmployeeForm({ ...employeeForm, mobile: text })}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleAddEmployee}>
              <Text style={styles.saveButtonText}>Add Employee</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setAddEmployeeModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
