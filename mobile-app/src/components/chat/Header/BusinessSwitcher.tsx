import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Business } from '../Types/business';


interface BusinessSwitcherProps {
  businesses: Business[];
  selectedBusiness: Business | null;
  onSelectBusiness: (business: Business) => void;
}

const BusinessSwitcher: React.FC<BusinessSwitcherProps> = ({
  businesses,
  selectedBusiness,
  onSelectBusiness,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleSelectBusiness = (business: Business) => {
    onSelectBusiness(business);
    setIsModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.switcherButton}
        onPress={toggleModal}
      >
        <View style={styles.switcherContent}>
          <Ionicons name="business-outline" size={20} color="#4A90E2" />
          <Text style={styles.selectedBusinessText} numberOfLines={1}>
            {selectedBusiness?.name || 'Select Business'}
          </Text>
          <Ionicons
            name={isModalVisible ? "chevron-up" : "chevron-down"}
            size={16}
            color="#4A90E2"
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={toggleModal}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Business</Text>
              <TouchableOpacity onPress={toggleModal}>
                <Ionicons name="close" size={24} color="#4A90E2" />
              </TouchableOpacity>
            </View>

            <FlatList<Business>
              data={businesses}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.businessItem,
                    selectedBusiness?.id === item.id && styles.selectedBusinessItem
                  ]}
                  onPress={() => handleSelectBusiness(item)}
                >
                  <Text style={styles.businessName}>{item.name}</Text>
                  {selectedBusiness?.id === item.id && (
                    <Ionicons name="checkmark" size={20} color="#4A90E2" />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContent}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  switcherButton: {
    backgroundColor: '#F5F7FA',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
    justifyContent: 'center',
    minWidth: 120,
    maxWidth: 200,
  },
  switcherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedBusinessText: {
    marginLeft: 8,
    marginRight: 4,
    fontSize: 14,
    color: '#1A1A1A',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  listContent: {
    padding: 16,
  },
  businessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedBusinessItem: {
    backgroundColor: '#F0F7FF',
  },
  businessName: {
    fontSize: 16,
    color: '#1A1A1A',
  },
});

export default BusinessSwitcher;
