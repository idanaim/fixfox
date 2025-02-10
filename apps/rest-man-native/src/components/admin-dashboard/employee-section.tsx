import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  useAddUser,
  useUsersByAdmin,
} from '../../queries/react-query-wrapper/use-users';
import { styles } from './admin-dashboard-styles';
import { User } from '../../interfaces/business';
import { useNavigation } from '@react-navigation/native';

export function EmployeeSection({ businessId }: { businessId?: number }) {
  const { data: employees, isLoading, error } = useUsersByAdmin(6);
  const { mutate: addUser } = useAddUser(6);
  const [isEditEmployeeModalVisible, setEditEmployeeModalVisible] =
    useState(false);
  const [isAddEmployeeModalVisible, setAddEmployeeModalVisible] =
    useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [employeeForm, setEmployeeForm] = useState<User>({
    name: '',
    email: '',
    role: '',
    mobile: '',
    businessId,
  });
  const navigation = useNavigation();
  const isAdding = false;
  const isUpdating = false;
  // const { mutate: addEmployee, isLoading: isAdding } = useAddEmployee();
  // const { mutate: updateEmployee, isLoading: isUpdating } = useUpdateEmployee();
  // const { mutate: deleteEmployee } = useDeleteEmployee();

  const handleAddEmployee = () => {
    if (
      !employeeForm.name ||
      !employeeForm.email ||
      !employeeForm.role ||
      !employeeForm.mobile
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    //
    addUser(employeeForm, {
      onSuccess: () => {
        Alert.alert('Success', 'Employee added successfully');
        setAddEmployeeModalVisible(false);
        setEmployeeForm({
          name: '',
          email: '',
          role: '',
          mobile: '',
          password: '',
          businessId,
        });
      },
      onError: () => {
        Alert.alert('Error', 'Failed to add employee');
      },
    });
  };

  const handleEditEmployee = () => {
    if (
      !employeeForm.name ||
      !employeeForm.email ||
      !employeeForm.role ||
      !employeeForm.mobile
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // updateEmployee(employeeForm, {
    //   onSuccess: () => {
    //     Alert.alert('Success', 'Employee updated successfully');
    //     setEditEmployeeModalVisible(false);
    //     setEmployeeForm({ name: '', email: '', role: '', mobile: '', businessId });
    //   },
    //   onError: () => {
    //     Alert.alert('Error', 'Failed to update employee');
    //   },
    // });
  };

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

  const renderEmployee = ({ item }: { item: User }) => (
    <View style={styles.employeeRow}>
      <Text style={styles.employeeText}>{item.name}</Text>
      <Text style={styles.employeeText}>{item.role}</Text>
      <Text style={styles.employeeText}>{item.email}</Text>
      <View style={styles.actionIcons}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            navigation.navigate('permissions', { user: item });
          }}
        >
          <MaterialIcons name="key" size={24} color="blue" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            setSelectedEmployee(item);
            setEmployeeForm(item);
            setEditEmployeeModalVisible(true);
          }}
        >
          <MaterialIcons name="edit" size={24} color="blue" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleDeleteEmployee(item.id)}
        >
          <MaterialIcons name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text>Error loading employees</Text>;

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Employee Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setAddEmployeeModalVisible(true)}
        >
          <MaterialIcons name="person-add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.sectionCard}>
        <FlatList<User>
          data={employees}
          renderItem={renderEmployee}
          keyExtractor={(item) => item?.id?.toString() || ''}
          style={styles.employeeList}
        />
      </View>
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
              onChangeText={(text) =>
                setEmployeeForm({ ...employeeForm, name: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={employeeForm.email}
              onChangeText={(text) =>
                setEmployeeForm({ ...employeeForm, email: text })
              }
              keyboardType="email-address"
            />
            <TextInput
              secureTextEntry={true}
              style={styles.input}
              placeholder="Password"
              value={employeeForm.password}
              onChangeText={(text) =>
                setEmployeeForm({ ...employeeForm, password: text })
              }
              keyboardType="password"
            />
            <TextInput
              style={styles.input}
              placeholder="Role"
              value={employeeForm.role}
              onChangeText={(text) =>
                setEmployeeForm({ ...employeeForm, role: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              value={employeeForm.mobile}
              onChangeText={(text) =>
                setEmployeeForm({ ...employeeForm, mobile: text })
              }
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddEmployee}
              disabled={isAdding}
            >
              {isAdding ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Add Employee</Text>
              )}
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

      {/* Edit Employee Modal */}
      <Modal
        visible={isEditEmployeeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditEmployeeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Employee</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={employeeForm.name}
              onChangeText={(text) =>
                setEmployeeForm({ ...employeeForm, name: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={employeeForm.email}
              onChangeText={(text) =>
                setEmployeeForm({ ...employeeForm, email: text })
              }
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={employeeForm.password}
              onChangeText={(text) =>
                setEmployeeForm({ ...employeeForm, password: text })
              }
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Role"
              value={employeeForm.role}
              onChangeText={(text) =>
                setEmployeeForm({ ...employeeForm, role: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              value={employeeForm.mobile}
              onChangeText={(text) =>
                setEmployeeForm({ ...employeeForm, mobile: text })
              }
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleEditEmployee}
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
              onPress={() => setEditEmployeeModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
