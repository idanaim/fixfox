import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Equipment } from '../../api/chatAPI';

interface EquipmentFormProps {
  onSubmit: (data: Partial<Equipment>) => void;
  loading: boolean;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({ onSubmit, loading }) => {
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = () => {
    // You can add validations if needed.
    onSubmit({ manufacturer, model, location, type });
  };

  return (
    <View style={{ padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#ddd' }}>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>
        Enter Appliance Details
      </Text>
      <TextInput
        placeholder="type"
        value={type}
        onChangeText={setType}
        style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Manufacturer"
        value={manufacturer}
        onChangeText={setManufacturer}
        style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Model"
        value={model}
        onChangeText={setModel}
        style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Location (optional)"
        value={location}
        onChangeText={setLocation}
        style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10 }}
      />
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        style={{
          alignItems: 'center',
          padding: 12,
          backgroundColor: '#007bff',
          borderRadius: 8,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontSize: 16 }}>Submit</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default EquipmentForm;
