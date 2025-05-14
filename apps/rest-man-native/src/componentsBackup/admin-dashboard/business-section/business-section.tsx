import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
  SafeAreaView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import {
  Avatar,
  IconButton,
  Modal,
  Surface,
  Text,
  Searchbar,
  Divider,
  Button
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, styles } from '../admin-dashboard-styles';
import { AddBusinessModal } from './add-business';
import { useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../../../store/auth.store';
import {
  useAddEmployeesToBusiness,
  useGetBusinesses,
} from '../../../queries/react-query-wrapper/use-get-business';
import { useUsersByAdmin } from '../../../queries/react-query-wrapper/use-users';

// Update the Business interface to include all required properties
interface Business {
  id: number;
  name: string;
  type: string;
  address?: string;
  mobile?: string;
  employees?: Array<any>;
}

// User interface for type safety
interface User {
  id: number;
  name: string;
  email: string;
}

// Props interface for BusinessSection
interface BusinessSectionProps {
  showAddBusinessModal?: boolean;
  setShowAddBusinessModal?: React.Dispatch<React.SetStateAction<boolean>>;
}

const { width, height } = Dimensions.get('window');

// Create a separate stylesheet for the modal
const modalStyles = StyleSheet.create({
  container: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  contentContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    width: '100%',
    maxHeight: height * 0.8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    ...styles.typography.h3,
    color: colors.dark,
  },
  searchBar: {
    marginBottom: 16,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  countsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  countText: {
    ...styles.typography.body2,
    color: colors.medium,
  },
  listContainer: {
    flexGrow: 0,
    flexShrink: 1,
    maxHeight: height * 0.55, // Limit the height so buttons remain visible
  },
  userItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selected: {
    backgroundColor: 'rgba(74, 21, 75, 0.05)',
  },
  userAvatar: {
    marginRight: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  listContentContainer: {
    paddingBottom: 16,
  }
});

export const BusinessSection = ({ 
  showAddBusinessModal = false, 
  setShowAddBusinessModal = () => {} 
}: BusinessSectionProps) => {
  const { user } = useAuthStore();
  const { data: businesses = [], isLoading } = useGetBusinesses(user?.accountId);
  const { data: allUsers = [] } = useUsersByAdmin(user?.accountId);
  const { mutate: addEmployees } = useAddEmployeesToBusiness();
  const queryClient = useQueryClient();
  const [selectedBusiness, setSelectedBusiness] = useState<number | null>(null);
  const [selectedBusinessName, setSelectedBusinessName] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isUserSelectModalVisible, setUserSelectModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddEmployees = () => {
    if (selectedBusiness && selectedUsers.length > 0) {
      addEmployees(
        { businessId: selectedBusiness, userIds: selectedUsers } as any,
        {
          onSuccess: () => {
            setSelectedUsers([]);
            queryClient.invalidateQueries(['businesses'] as any);
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

  const getLogoLabel = (name: string): string => {
    if (!name) return '?';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    }
    return name[0];
  };

  const openUserSelectionModal = (business: Business) => {
    setSelectedBusiness(business.id);
    setSelectedBusinessName(business.name);
    setUserSelectModalVisible(true);
  };

  const filteredUsers = searchQuery
    ? allUsers.filter((user: User) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allUsers;

  const renderBusinessItem = ({ item }: { item: Business }) => {
    return (
      <Surface style={styles.listItem}>
        <Avatar.Text
          size={40}
          label={getLogoLabel(item.name)}
          style={{ backgroundColor: colors.secondary, marginRight: 12 }}
        />

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userRole}>
            {item.type} • {item?.address || 'No address provided'}
          </Text>
          <View
            style={{ flexDirection: 'row', marginTop: 4, alignItems: 'center' }}
          >
            <Icon
              name="account-group"
              size={14}
              color={colors.medium}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.userRole}>
              {item?.employees?.length || 0} employees
            </Text>
          </View>
          <View
            style={{ flexDirection: 'row', marginTop: 4, alignItems: 'center' }}
          >
            <Icon
              name="cellphone"
              size={14}
              color={colors.medium}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.userRole}>{item?.mobile || 'No phone provided'}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row' }}>
          <IconButton
            icon="account-plus"
            iconColor={colors.primary}
            size={20}
            onPress={() => openUserSelectionModal(item)}
            style={styles.actionButton}
            accessibilityLabel="Add users to business"
          />
          <IconButton
            icon="pencil"
            iconColor={colors.success}
            size={20}
            onPress={() => {}}
            style={styles.actionButton}
          />
          <IconButton
            icon="delete"
            iconColor={colors.error}
            size={20}
            onPress={() => {}}
            style={styles.actionButton}
          />
        </View>
      </Surface>
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!businesses || businesses.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Icon
          name="store-off"
          size={48}
          color={colors.medium}
          style={styles.emptyStateIcon}
        />
        <Text style={styles.emptyStateText}>No businesses found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={businesses}
        renderItem={renderBusinessItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 8 }}
      />
      
      {/* Add Business Modal */}
      <AddBusinessModal
        isAddBusinessModalVisible={showAddBusinessModal}
        setAddBusinessModalVisible={setShowAddBusinessModal}
      />
      
      {/* User Selection Modal */}
      <Modal
        visible={isUserSelectModalVisible}
        onDismiss={() => setUserSelectModalVisible(false)}
        contentContainerStyle={modalStyles.container}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <SafeAreaView style={modalStyles.contentContainer}>
            {/* Fixed Header */}
            <View style={modalStyles.header}>
              <View style={modalStyles.headerRow}>
                <Text style={modalStyles.headerTitle}>
                  Add Users to {selectedBusinessName}
                </Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setUserSelectModalVisible(false)}
                />
              </View>
              
              <Searchbar
                placeholder="Search users..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={modalStyles.searchBar}
                iconColor={colors.medium}
                inputStyle={{ color: colors.dark }}
              />
              
              <View style={modalStyles.countsRow}>
                <Text style={modalStyles.countText}>
                  {filteredUsers.length} users available
                </Text>
                <Text style={modalStyles.countText}>
                  {selectedUsers.length} selected
                </Text>
              </View>
            </View>

            {/* Scrollable List with fixed height */}
            <View style={modalStyles.listContainer}>
              <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      modalStyles.userItem,
                      selectedUsers.includes(item.id) && modalStyles.selected
                    ]}
                    onPress={() => toggleUserSelection(item.id)}
                  >
                    <Avatar.Text
                      size={36}
                      label={getLogoLabel(item.name)}
                      style={[
                        modalStyles.userAvatar,
                        { 
                          backgroundColor: selectedUsers.includes(item.id) 
                            ? colors.primary 
                            : colors.medium
                        }
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.userName}>{item.name}</Text>
                      <Text style={styles.userRole}>{item.email}</Text>
                    </View>
                    {selectedUsers.includes(item.id) ? (
                      <Icon name="checkbox-marked-circle" size={24} color={colors.primary} />
                    ) : (
                      <Icon name="checkbox-blank-circle-outline" size={24} color={colors.medium} />
                    )}
                  </TouchableOpacity>
                )}
                contentContainerStyle={modalStyles.listContentContainer}
              />
            </View>
            
            {/* Fixed Footer */}
            <View style={modalStyles.footer}>
              <Button 
                mode="outlined"
                style={{ borderColor: colors.border }}
                labelStyle={{ color: colors.dark }}
                onPress={() => setUserSelectModalVisible(false)}
              >
                Cancel
              </Button>
              
              <Button 
                mode="contained"
                style={{ backgroundColor: colors.primary }}
                disabled={selectedUsers.length === 0}
                onPress={handleAddEmployees}
              >
                Add {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''} Users
              </Button>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};
