import { MaterialIcons } from '@expo/vector-icons';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { Business } from '../../../interfaces/business';
import { styles as globalStyles } from '../admin-dashboard-styles';

{
  /* Edit Employee Modal */
}

interface BusinessSectionProps {
  businesses: Business[];
}

interface EmployeeForm {
  name: string;
  email: string;
  role: string;
  mobile: string;
}

export function AddUserBusiness({ businesses }: BusinessSectionProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isAddEmployeeModalVisible, setAddEmployeeModalVisible] = useState(false);
  const [employeeForm, setEmployeeForm] = useState<EmployeeForm>({
    name: '',
    email: '',
    role: '',
    mobile: '',
  });

  const handleAddEmployee = () => {
    // TODO: Implement add employee logic
    console.log('Adding employee:', employeeForm);
    setAddEmployeeModalVisible(false);
    // Reset form
    setEmployeeForm({
      name: '',
      email: '',
      role: '',
      mobile: '',
    });
  };

  const handleDeleteBusiness = (businessId: string | number) => {
    // TODO: Implement delete business logic
    console.log('Deleting business:', businessId);
  };

  return (
    <View>
      {businesses?.map((business) => (
        <View style={globalStyles.sectionCard} key={business.id}>
          <View style={globalStyles.businessHeader}>
            <Text style={globalStyles.sectionTitle}>{business.name}</Text>
            <View style={globalStyles.businessActions}>
              <TouchableOpacity
                style={globalStyles.iconButton}
                onPress={() => {
                  setSelectedBusiness(business);
                  setAddEmployeeModalVisible(true);
                }}
              >
                <MaterialIcons name="person-add" size={24} color="green" />
              </TouchableOpacity>
              <TouchableOpacity
                style={globalStyles.iconButton}
                onPress={() => handleDeleteBusiness(business.id || 0)}
              >
                <MaterialIcons name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={globalStyles.label}>ID: {business.id || 'N/A'}</Text>
          <Text style={globalStyles.label}>Phone: {business.mobile || 'N/A'}</Text>
          <Text style={globalStyles.label}>Address: {business.address || 'N/A'}</Text>
          <Text style={globalStyles.label}>Type: {business.type || 'N/A'}</Text>
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
