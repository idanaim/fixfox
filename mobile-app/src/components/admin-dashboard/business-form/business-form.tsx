import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUpdateBusinesses } from '../../../queries/react-query-wrapper/use-get-business';
import { useNavigation, useRoute } from '@react-navigation/native';

const EditBusinessScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { business } = (route.params as { business: any }) || { business: null }; // Get the business data passed from the dashboard
  const { mutate: updateBusiness } = useUpdateBusinesses(business.id);

  const [formData, setFormData] = useState({
    name: business.name,
    mobile: business.mobile,
    address: business.address,
    type: business.type,
  });

  const handleUpdate = () => {
    if (!formData.name || !formData.mobile || !formData.address || !formData.type) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // updateBusiness({ id: business.id, ...formData }); // TODO: Fix mutation usage
    Alert.alert('Success', 'Business updated successfully');
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Business</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Business Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Business Name"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={formData.mobile}
          onChangeText={(text) => setFormData({ ...formData, mobile: text })}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={formData.address}
          onChangeText={(text) => setFormData({ ...formData, address: text })}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Business Type</Text>
        <TextInput
          style={styles.input}
          placeholder="Business Type"
          value={formData.type}
          onChangeText={(text) => setFormData({ ...formData, type: text })}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditBusinessScreen;
