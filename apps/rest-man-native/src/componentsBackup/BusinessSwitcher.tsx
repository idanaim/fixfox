import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Text,
} from 'react-native';
import { Avatar, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useBusiness } from '../hooks/useBusiness';

interface Business {
  id: number;
  name: string;
  logo?: string;
}

export const BusinessSwitcher = () => {
  const { colors } = useTheme();
  const { currentBusiness, setCurrentBusiness } = useBusiness();
  const [modalVisible, setModalVisible] = useState(false);
  const [businesses] = useState<Business[]>([
    // This would typically come from an API
    { id: 1, name: 'Restaurant A', logo: 'https://example.com/logo1.png' },
    { id: 2, name: 'Restaurant B', logo: 'https://example.com/logo2.png' },
  ]);

  const handleBusinessSelect = (business: Business) => {
    setCurrentBusiness(business);
    setModalVisible(false);
  };

  const renderBusinessItem = ({ item }: { item: Business }) => (
    <TouchableOpacity
      style={[
        styles.businessItem,
        item.id === currentBusiness?.id && {
          backgroundColor: colors.primaryContainer,
        },
      ]}
      onPress={() => handleBusinessSelect(item)}
    >
      <Avatar.Image
        size={40}
        source={{ uri: item.logo }}
        style={styles.businessLogo}
      />
      <Text
        style={[
          styles.businessName,
          item.id === currentBusiness?.id && {
            color: colors.primary,
            fontWeight: '600',
          },
        ]}
      >
        {item.name}
      </Text>
      {item.id === currentBusiness?.id && (
        <Ionicons
          name="checkmark-circle"
          size={24}
          color={colors.primary}
          style={styles.checkIcon}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setModalVisible(true)}
      >
        <Avatar.Image
          size={32}
          source={{ uri: currentBusiness?.logo }}
          style={styles.avatar}
        />
        <View style={styles.businessInfo}>
          <Text style={styles.currentBusinessName} numberOfLines={1}>
            {currentBusiness?.name}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.text} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.background }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Business
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={businesses}
              renderItem={renderBusinessItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.businessList}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  avatar: {
    marginRight: 8,
  },
  businessInfo: {
    flex: 1,
    marginRight: 8,
  },
  currentBusinessName: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  businessList: {
    paddingHorizontal: 20,
  },
  businessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  businessLogo: {
    marginRight: 12,
  },
  businessName: {
    flex: 1,
    fontSize: 16,
  },
  checkIcon: {
    marginLeft: 12,
  },
}); 