import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { Equipment } from '../../../api/chatAPI';
import { useDashboardStore } from '../../../store/dashboard.store';
import { API_BASE_URL } from '../../../config';

interface AddApplianceFormProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ApplianceFormData {
  type: string;
  manufacturer: string;
  model: string;
  location: string;
  serialNumber: string;
  category: string;
  status: string;
  supplier: string;
  purchasePrice: string;
  tags: string;
}

const EQUIPMENT_CATEGORIES = [
  'HVAC',
  'Kitchen', 
  'Refrigeration',
  'Cleaning',
  'Office',
  'Other',
];

const EQUIPMENT_STATUSES = [
  { value: 'operational', label: 'Operational' },
  { value: 'maintenance_needed', label: 'Maintenance Needed' },
  { value: 'under_repair', label: 'Under Repair' },
  { value: 'retired', label: 'Retired' },
];

export const AddApplianceForm: React.FC<AddApplianceFormProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { selectedBusiness } = useDashboardStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ApplianceFormData>({
    type: '',
    manufacturer: '',
    model: '',
    location: '',
    serialNumber: '',
    category: 'Other',
    status: 'operational',
    supplier: '',
    purchasePrice: '',
    tags: '',
  });

  const handleInputChange = (field: keyof ApplianceFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    const requiredFields = ['type', 'manufacturer', 'model'];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof ApplianceFormData].trim()) {
        Alert.alert(
          t('appliances.form.validationError'),
          t('appliances.form.requiredFieldsMessage')
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !selectedBusiness) {
      return;
    }

    setLoading(true);

    try {
      const submitData: Partial<Equipment> = {
        type: formData.type.trim(),
        manufacturer: formData.manufacturer.trim(),
        model: formData.model.trim(),
        location: formData.location.trim() || undefined,
        serialNumber: formData.serialNumber.trim() || undefined,
        category: formData.category,
        status: formData.status as any,
        supplier: formData.supplier.trim() || undefined,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
        businessId: selectedBusiness.id,
      };

      const response = await fetch(`${API_BASE_URL}/equipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create appliance: ${response.statusText}`);
      }

      Alert.alert(
        t('appliances.form.success'),
        t('appliances.form.applianceCreated'),
        [
          {
            text: t('common.ok'),
            onPress: () => {
              resetForm();
              onSuccess();
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating appliance:', error);
      Alert.alert(
        t('appliances.form.error'),
        error instanceof Error ? error.message : t('appliances.form.unknownError')
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: '',
      manufacturer: '',
      model: '',
      location: '',
      serialNumber: '',
      category: 'Other',
      status: 'operational',
      supplier: '',
      purchasePrice: '',
      tags: '',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#1D1C1D" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('appliances.form.addAppliance')}</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          >
            <Text style={[styles.saveButtonText, loading && styles.saveButtonTextDisabled]}>
              {loading ? t('common.saving') : t('common.save')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('appliances.form.basicInfo')}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('appliances.form.type')} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.type}
                onChangeText={(value) => handleInputChange('type', value)}
                placeholder={t('appliances.form.typePlaceholder')}
                placeholderTextColor="#868686"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('appliances.form.manufacturer')} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.manufacturer}
                onChangeText={(value) => handleInputChange('manufacturer', value)}
                placeholder={t('appliances.form.manufacturerPlaceholder')}
                placeholderTextColor="#868686"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('appliances.form.model')} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.model}
                onChangeText={(value) => handleInputChange('model', value)}
                placeholder={t('appliances.form.modelPlaceholder')}
                placeholderTextColor="#868686"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('appliances.form.location')}</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(value) => handleInputChange('location', value)}
                placeholder={t('appliances.form.locationPlaceholder')}
                placeholderTextColor="#868686"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('appliances.form.serialNumber')}</Text>
              <TextInput
                style={styles.input}
                value={formData.serialNumber}
                onChangeText={(value) => handleInputChange('serialNumber', value)}
                placeholder={t('appliances.form.serialNumberPlaceholder')}
                placeholderTextColor="#868686"
              />
            </View>
          </View>

          {/* Category and Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('appliances.form.categoryStatus')}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('appliances.form.category')}</Text>
              <View style={styles.categoryGrid}>
                {EQUIPMENT_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      formData.category === category && styles.categoryButtonSelected
                    ]}
                    onPress={() => handleInputChange('category', category)}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      formData.category === category && styles.categoryButtonTextSelected
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('appliances.form.status')}</Text>
              <View style={styles.categoryGrid}>
                {EQUIPMENT_STATUSES.map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    style={[
                      styles.categoryButton,
                      formData.status === status.value && styles.categoryButtonSelected
                    ]}
                    onPress={() => handleInputChange('status', status.value)}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      formData.status === status.value && styles.categoryButtonTextSelected
                    ]}>
                      {t(`appliances.status.${status.value}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Additional Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('appliances.form.supplier')}</Text>
              <TextInput
                style={styles.input}
                value={formData.supplier}
                onChangeText={(value) => handleInputChange('supplier', value)}
                placeholder={t('appliances.form.supplierPlaceholder')}
                placeholderTextColor="#868686"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('appliances.form.purchasePrice')}</Text>
              <TextInput
                style={styles.input}
                value={formData.purchasePrice}
                onChangeText={(value) => handleInputChange('purchasePrice', value)}
                placeholder="0.00"
                placeholderTextColor="#868686"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('appliances.form.tags')}</Text>
              <TextInput
                style={styles.input}
                value={formData.tags}
                onChangeText={(value) => handleInputChange('tags', value)}
                placeholder={t('appliances.form.tagsPlaceholder')}
                placeholderTextColor="#868686"
              />
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
    ...Platform.select({
      ios: {
        paddingTop: 44,
      },
    }),
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1C1D',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007A5A',
    borderRadius: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#868686',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButtonTextDisabled: {
    color: '#CCCCCC',
  },
  form: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1C1D',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1C1D',
    marginBottom: 6,
  },
  required: {
    color: '#E01E5A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1D1C1D',
    backgroundColor: '#FFFFFF',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonSelected: {
    backgroundColor: '#007A5A',
    borderColor: '#007A5A',
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#616061',
  },
  categoryButtonTextSelected: {
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 32,
  },
}); 