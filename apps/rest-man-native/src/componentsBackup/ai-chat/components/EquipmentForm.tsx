import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Button,
  Image,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export const EquipmentForm = ({ initialType, onSubmit }) => {
  const [form, setForm] = useState({ type: initialType });
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setForm({...form, photo: result.assets[0].uri });
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Register New Equipment</Text>

      <TouchableOpacity
        style={styles.imageContainer}
        onPress={pickImage}
      >
        {form.photo ? (
          <Image
            source={{ uri: form.photo }}
            style={styles.image}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera" size={32} color="#888" />
            <Text style={styles.imageText}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Equipment Type</Text>
        <TextInput
          style={styles.input}
          value={form.type}
          onChangeText={(t) => setForm({...form, type: t})}
          placeholder="Refrigerator, HVAC, etc."
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Manufacturer</Text>
        <TextInput
          style={styles.input}
          value={form.manufacturer}
          onChangeText={(t) => setForm({...form, manufacturer: t})}
          placeholder="Brand name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Model Number</Text>
        <TextInput
          style={styles.input}
          value={form.model}
          onChangeText={(t) => setForm({...form, model: t})}
          placeholder="Model identifier"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Purchase Date</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {date.toLocaleDateString() || 'Select date'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);
                setForm({...form, purchaseDate: selectedDate});
              }
            }}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={() => onSubmit(form)}
      >
        <Text style={styles.submitText}>Save Equipment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imageText: {
    marginTop: 8,
    color: '#888',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#555',
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateInput: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateText: {
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EquipmentForm;
