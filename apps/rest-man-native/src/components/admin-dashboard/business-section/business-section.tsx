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
  const { data: businesses } = useGetBusinesses(22);
  const { data: allUsers } = useUsersByAdmin(22);
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
        <View style={styles.businessCard} key={business.id}>
          {/* Header with Contextual Actions */}
          <View style={styles.cardHeader}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.businessName} numberOfLines={1}>
                {business.name}
              </Text>
              <Text style={styles.businessType}>{business.type}</Text>
            </View>

            <TouchableOpacity
              style={styles.addEmployeeButton}
              onPress={() => {
                setSelectedBusiness(business.id);
                setUserSelectModalVisible(true);
              }}
            >
              <MaterialIcons name="group-add" size={22} color="#fff" />
              <Text style={styles.addButtonText}>Add People</Text>
            </TouchableOpacity>
          </View>

          {/* Business Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <MaterialIcons name="fingerprint" size={18} color="#718096" />
              <Text style={styles.detailText}>ID: {business.id}</Text>
            </View>

            <View style={styles.detailItem}>
              <MaterialIcons name="phone" size={18} color="#718096" />
              <Text style={styles.detailText}>
                {business.mobile || 'Not provided'}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <MaterialIcons name="location-on" size={18} color="#718096" />
              <Text style={styles.detailText} numberOfLines={1}>
                {business.address}
              </Text>
            </View>
          </View>

          {/* Employees Section */}
          <View style={styles.employeesSection}>
            <View style={styles.employeesHeader}>
              <Text style={styles.employeesTitle}>
                Team Members ({business.employees?.length || 0})
              </Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All →</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              horizontal
              data={business.employees?.slice(0, 5)}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                console.log(item);
                const avatarName = item.user.name
                  ?.split(' ')
                  ?.map((n) => n[0])
                  ?.join('');
                return (
                  <TouchableOpacity style={styles.employeeBadge}>
                    <View style={styles.employeeAvatar}>
                      <Text style={styles.avatarText}>
                        {avatarName}
                      </Text>
                    </View>
                    <Text style={styles.employeeBadgeName} numberOfLines={1}>
                      {item?.user?.name?.split(' ')[0]}
                    </Text>
                    <Text style={styles.employeeBadgeRole} numberOfLines={1}>
                      {item.role}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyEmployeesText}>
                  No team members added yet
                </Text>
              }
            />
          </View>
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
