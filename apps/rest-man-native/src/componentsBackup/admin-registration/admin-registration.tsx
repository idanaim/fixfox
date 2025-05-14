import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useRegisterEmployee from '../../queries/use-save-admin-reg';

export const AdminRegistration = () => {
  const { mutate } = useRegisterEmployee();
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      admin: { name: '', email: '', password: '', mobile: '' },
      businesses: [],
      users: [],
    },
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const addBusiness = () => {
    const businesses = watch('businesses');
    setValue('businesses', [
      ...businesses,
      { name: '', address: '', mobile: '', type: '' },
    ]);
  };

  const addUser = () => {
    const users = watch('users');
    setValue('users', [
      ...users,
      { name: '', email: '', mobile: '', password: '' },
    ]);
  };
  const removeBusiness = (index) => {
    const businesses = watch('businesses');
    setValue(
      'businesses',
      businesses.filter((_, i) => i !== index)
    );
  };
  const removeUser = (index) => {
    const users = watch('users');
    setValue(
      'users',
      users.filter((_, i) => i !== index)
    );
  };

  const onSubmit = (data) => {
    const transformedData = {
      admin: {
        name: data.admin.name,
        email: data.admin.email,
        password: data.admin.password,
        mobile: data.admin.mobile,
      },
      businesses: data.businesses.map((business) => ({
        name: business.name,
        address: business.address,
        mobile: business.mobile,
        type: business.type,
      })),
      employees: data.users.map((employee) => ({
        name: employee.name,
        email: employee.email,
        password: employee.password || 'defaultPassword',
        mobile: employee.mobile,
      })),
    };

    console.log('Transformed Data:', transformedData);
    mutate(transformedData);
  };

  const renderStepHeader = (stepNumber: number, title: string) => (
    <View style={styles.stepHeader}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{stepNumber}</Text>
      </View>
      <Text style={styles.stepTitle}>{title}</Text>
    </View>
  );
  const renderInput = (name: string, label: string, rules?: any, secure?: boolean) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[
              styles.input,
              focusedField === name && styles.focusedInput,
              errors[name] && styles.errorBorder
            ]}
            placeholder={`Enter ${label}`}
            value={value}
            onChangeText={onChange}
            onFocus={() => setFocusedField(name)}
            onBlur={() => setFocusedField(null)}
            secureTextEntry={secure}
            placeholderTextColor="#94A3B8"
          />
        )}
      />
      {errors[name] && <Text style={styles.errorText}>{errors[name].message}</Text>}
    </>
  );

  const renderAdminDetails = () => (
    <>
      {renderStepHeader(1, 'Admin Details')}
      {renderInput('admin.name', 'Admin Name', { required: 'Name is required' })}
      {renderInput('admin.email', 'Admin Email', {
        required: 'Email is required',
        pattern: { value: /^\S+@\S+$/, message: 'Invalid email format' }
      })}
      {renderInput('admin.password', 'Admin Password', {
        required: 'Password is required'
      }, true)}
      {renderInput('admin.mobile', 'Mobile Number', {
        required: 'Mobile number is required',
        pattern: { value: /^[0-9]{10}$/, message: 'Invalid mobile number format' }
      })}
    </>
  );

  const renderBusinesses = () => {
    const businesses = watch('businesses');
    return (
      <>
        {renderStepHeader(2, 'Business Information')}
        {businesses.map((_, index) => (
          <View key={index} style={styles.box}>
            <Text style={styles.boxTitle}>Business {index + 1}</Text>
            {renderInput(`businesses.${index}.name`, 'Business Name')}
            {renderInput(`businesses.${index}.address`, 'Business Address')}
            {renderInput(`businesses.${index}.mobile`, 'Business Phone')}
            {renderInput(`businesses.${index}.type`, 'Business Type')}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeBusiness(index)}>
              <Icon name="trash-can-outline" size={20} color="#EF4444" />
              <Text style={styles.removeButtonText}>Remove Business</Text>
            </TouchableOpacity>
          </View>
        ))}
      </>
    );
  };

  const renderUsers = () => {
    const users = watch('users');
    return (
      <>
        {renderStepHeader(3, 'User Information')}
        {users.map((_, index) => (
          <View key={index} style={styles.box}>
            <Text style={styles.boxTitle}>User {index + 1}</Text>
            {renderInput(`users.${index}.name`, 'User Name')}
            {renderInput(`users.${index}.email`, 'User Email')}
            {renderInput(`users.${index}.mobile`, 'Mobile Number')}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeUser(index)}>
              <Icon name="trash-can-outline" size={20} color="#EF4444" />
              <Text style={styles.removeButtonText}>Remove User</Text>
            </TouchableOpacity>
          </View>
        ))}
      </>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Setup Your Organization</Text>

        {/* Progress Indicators */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
        </View>
        <View style={styles.stepIndicator}>
          {[1, 2, 3].map((step) => (
            <View key={step} style={[
              styles.stepCircle,
              currentStep >= step && styles.activeStepCircle
            ]}>
              <Text style={[
                styles.stepText,
                currentStep >= step && styles.activeStepText
              ]}>
                {step}
              </Text>
            </View>
          ))}
        </View>

        {/* Form Content */}
        {currentStep === 1 && renderAdminDetails()}
        {currentStep === 2 && renderBusinesses()}
        {currentStep === 3 && renderUsers()}

        {/* Navigation Buttons */}
        <View style={styles.navButtons}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[styles.buttonBase, styles.backButton]}
              onPress={() => setCurrentStep(currentStep - 1)}>
              <Icon name="chevron-left" size={24} color="#64748B" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          {currentStep < totalSteps ? (
            <TouchableOpacity
              style={[styles.buttonBase, styles.nextButton]}
              onPress={() => setCurrentStep(currentStep + 1)}>
              <Text style={styles.buttonText}>Next</Text>
              <Icon name="chevron-right" size={24} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.buttonBase, styles.submitButton]}
              onPress={handleSubmit(onSubmit)}>
              <Icon name="check-circle" size={24} color="white" />
              <Text style={styles.buttonText}>Complete Setup</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      {(currentStep === 2 || currentStep === 3) && (
        <TouchableOpacity
          style={styles.floatingAddButton}
          onPress={currentStep === 2 ? addBusiness : addUser}>
          <Icon name="plus" size={28} color="white" />
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
};

// Updated Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    // fontFamily: 'Inter-Bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginBottom: 24,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4F46E5',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
  },
  activeStepCircle: {
    backgroundColor: '#4F46E5',
  },
  stepText: {
    color: '#64748B',
    // fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  activeStepText: {
    color: 'white',
  },
  label: {
    fontSize: 14,
    // fontFamily: 'Inter-Medium',
    marginBottom: 8,
    color: '#64748B',
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: 'white',
    fontSize: 16,
    color: '#1E293B',
    // fontFamily: 'Inter-Regular',
  },
  focusedInput: {
    borderColor: '#4F46E5',
    backgroundColor: '#F8FAFF',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  errorBorder: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 12,
    // fontFamily: 'Inter-Medium',
  },
  navButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
  },
  buttonBase: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  backButton: {
    backgroundColor: '#F1F5F9',
  },
  backButtonText: {
    color: '#64748B',
    // fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#4F46E5',
  },
  submitButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    // fontFamily: 'Inter-SemiBold',
  },
  box: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  boxTitle: {
    fontSize: 18,
    // fontFamily: 'Inter-Bold',
    marginBottom: 16,
    color: '#1E293B',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  removeButtonText: {
    color: '#EF4444',
    // fontFamily: 'Inter-SemiBold',
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#4F46E5',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#4F46E5',
    // fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  stepTitle: {
    fontSize: 20,
    // fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
});

export default AdminRegistration;
