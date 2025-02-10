import React, { useState } from 'react';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUsersByAdmin } from '../../../queries/react-query-wrapper/use-users';
import {
  useAddEmployeesToBusiness,
  useGetBusinesses,
} from '../../../queries/react-query-wrapper/use-get-business';
import { styles } from '../admin-dashboard-styles';
import { AddBusinessModal } from './add-business';

export function BusinessSection() {
  const { data: businesses } = useGetBusinesses(8);
  const { data: allUsers } = useUsersByAdmin(6);
  const { mutate: addEmployees } = useAddEmployeesToBusiness();

  const [selectedBusiness, setSelectedBusiness] = useState<number | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isUserSelectModalVisible, setUserSelectModalVisible] = useState(false);
  const [isAddBusinessModalVisible, setAddBusinessModalVisible] =
    useState(false);

  const handleAddEmployees = () => {
    if (selectedBusiness && selectedUsers.length > 0) {
      addEmployees(
        { businessId: selectedBusiness, userIds: selectedUsers },
        {
          onSuccess: () => {
            setSelectedUsers([]);
            setUserSelectModalVisible(false);
          },
        }
      );
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Businesses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setAddBusinessModalVisible(true)}
        >
          <MaterialIcons name="add-business" size={24} color="white" />
        </TouchableOpacity>
      </View>
      {businesses?.map((business) => (
        <View style={styles.sectionCard} key={business.id}>
          <View style={styles.businessHeader}>
            <Text style={styles.sectionTitle}>{business.name}</Text>
            <View style={styles.businessActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  setSelectedBusiness(business.id);
                  setUserSelectModalVisible(true);
                }}
              >
                <MaterialIcons name="person-add" size={24} color="green" />
              </TouchableOpacity>
            </View>
          </View>
          <View>
            <Text style={styles.label}>ID: {business.id}</Text>
            <Text style={styles.label}>Phone: {business.mobile}</Text>
            <Text style={styles.label}>Address: {business.address}</Text>
            <Text style={styles.label}>Type: {business.type}</Text>
          </View>
          {/* Current Employees */}
          <Text style={styles.subSectionTitle}>
            Employees ({business.employees?.length || 0})
          </Text>
          {business.employees?.map((employee) => (
            <View key={employee.id} style={styles.employeeItem}>
              <Text style={styles.employeeName}>{employee.name}</Text>
              <Text style={styles.employeeRole}>{employee.role}</Text>
            </View>
          ))}
        </View>
      ))}

      {/* Add Business Modal */}
      <AddBusinessModal
        isAddBusinessModalVisible={isAddBusinessModalVisible}
        setAddBusinessModalVisible={setAddBusinessModalVisible}
      />
      {/* User Selection Modal */}
      <Modal
        visible={isUserSelectModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setUserSelectModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Users to Add</Text>

            <FlatList
              data={allUsers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.userItem,
                    selectedUsers.includes(item.id) && styles.selectedUserItem,
                  ]}
                  onPress={() => toggleUserSelection(item.id)}
                >
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                  {selectedUsers.includes(item.id) && (
                    <MaterialIcons name="check-box" size={24} color="#2ecc71" />
                  )}
                </TouchableOpacity>
              )}
            />

            <View style={styles.modalButtonGroup}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setUserSelectModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAddEmployees}
              >
                <Text style={styles.buttonText}>
                  Add ({selectedUsers.length}) Users
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
