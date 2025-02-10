// Add this modal to your JSX
import React, { useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '../admin-dashboard-styles';

interface AddBusinessModalProps {
  isAddBusinessModalVisible: boolean;
  setAddBusinessModalVisible: (isVisible: boolean) => void;
}

export function AddBusinessModal  ({ isAddBusinessModalVisible, setAddBusinessModalVisible }: AddBusinessModalProps) {
  const [newBusiness, setNewBusiness] = useState({
    name: '',
    address: '',
    mobile: '',
    type: ''
  });
  const handleCreateBusiness = () => {
    if (!newBusiness.name || !newBusiness.address) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    // createBusiness(newBusiness, {
    //   onSuccess: () => {
    //     setAddBusinessModalVisible(false);
    //     setNewBusiness({ name: '', address: '', mobile: '', type: '' });
    //   }
    // });
  };
  return (<Modal
      visible={isAddBusinessModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setAddBusinessModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create New Business</Text>

          <TextInput
            style={styles.input}
            placeholder="Business Name *"
            value={newBusiness.name}
            onChangeText={text => setNewBusiness({ ...newBusiness, name: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Address *"
            value={newBusiness.address}
            onChangeText={text => setNewBusiness({ ...newBusiness, address: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={newBusiness.mobile}
            onChangeText={text => setNewBusiness({ ...newBusiness, mobile: text })}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Business Type"
            value={newBusiness.type}
            onChangeText={text => setNewBusiness({ ...newBusiness, type: text })}
          />

          <View style={styles.modalButtonGroup}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setAddBusinessModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleCreateBusiness}
            >
              <Text style={styles.buttonText}>Create Business</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
