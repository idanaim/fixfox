import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import useRegisterEmployee from '../../queries/use-save-admin-reg';

export const AdminRegistration = () => {
  const { mutate } = useRegisterEmployee();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      admin: {
        name: '',
        email: '',
        password: '',
        mobile: '',
      },
      businesses: [],
      users: [],
    },
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

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

  const renderAdminDetails = () => (
    <>
      <Text style={styles.label}>Admin Name</Text>
      <Controller
        control={control}
        name="admin.name"
        rules={{ required: 'Name is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.admin?.name && styles.errorBorder]}
            placeholder="Enter Admin Name"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.admin?.name && (
        <Text style={styles.errorText}>{errors.admin.name.message}</Text>
      )}

      <Text style={styles.label}>Admin Email</Text>
      <Controller
        control={control}
        name="admin.email"
        rules={{
          required: 'Email is required',
          pattern: { value: /^\S+@\S+$/, message: 'Invalid email format' },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.admin?.email && styles.errorBorder]}
            placeholder="Enter Admin Email"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.admin?.email && (
        <Text style={styles.errorText}>{errors.admin.email.message}</Text>
      )}

      <Text style={styles.label}>Admin Password</Text>
      <Controller
        control={control}
        name="admin.password"
        rules={{ required: 'Password is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.admin?.password && styles.errorBorder]}
            placeholder="Enter Admin Password"
            value={value}
            onChangeText={onChange}
            secureTextEntry={true}
          />
        )}
      />
      {errors.admin?.password && (
        <Text style={styles.errorText}>{errors.admin.password.message}</Text>
      )}
      <Text style={styles.label}>Admin Mobile Number</Text>
      <Controller
        control={control}
        name="admin.mobile"
        rules={{
          required: 'Mobile number is required',
          pattern: {
            value: /^[0-9]{10}$/,
            message: 'Invalid mobile number format',
          },
        }}
        keyboardType="phone-pad"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.admin?.mobile && styles.errorBorder]}
            placeholder="Enter Mobile Number"
            maxLength={10}
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.admin?.mobile && (
        <Text style={styles.errorText}>{errors.admin.mobile.message}</Text>
      )}
    </>
  );

  const renderBusinesses = () => {
    const businesses = watch('businesses');
    return (
      <>
        <TouchableOpacity style={styles.addButton} onPress={addBusiness}>
          <Text style={styles.buttonText}>Add Business</Text>
        </TouchableOpacity>
        {businesses.map((_, index) => (
          <View key={index} style={styles.box}>
            <Text style={styles.boxTitle}>Business {index + 1}</Text>
            <Text style={styles.label}>Business Name</Text>
            <Controller
              control={control}
              name={`businesses.${index}.name`}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Enter Business Name"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            <Text style={styles.label}>Business Address</Text>
            <Controller
              control={control}
              name={`businesses.${index}.address`}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Enter Business Address"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            <Text style={styles.label}>Business Phone</Text>
            <Controller
              control={control}
              name={`businesses.${index}.mobile`}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Enter Business Phone"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Text style={styles.label}>Business Type</Text>
            <Controller
              control={control}
              name={`businesses.${index}.type`}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Enter Business Type"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeBusiness(index)}
            >
              <Text style={styles.buttonText}>Remove Business</Text>
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
        <TouchableOpacity style={styles.addButton} onPress={addUser}>
          <Text style={styles.buttonText}>Add User</Text>
        </TouchableOpacity>
        {users.map((_, index) => (
          <View key={index} style={styles.box}>
            <Text style={styles.boxTitle}>User {index + 1}</Text>
            <Text style={styles.label}>User Name</Text>
            <Controller
              control={control}
              name={`users.${index}.name`}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Enter User Name"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            <Text style={styles.label}>User Email</Text>
            <Controller
              control={control}
              name={`users.${index}.email`}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Enter User Email"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            <Text style={styles.label}>User Mobile Number</Text>
            <Controller
              control={control}
              name={`users.${index}.mobile`}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  rules={{
                    required: 'Mobile number is required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Invalid mobile number format',
                    },
                  }}
                  keyboardType="phone-pad"
                  style={styles.input}
                  placeholder="Enter User Mobile Number"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeUser(index)}
            >
              <Text style={styles.buttonText}>Remove User</Text>
            </TouchableOpacity>
          </View>
        ))}
      </>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Employee Registration Wizard</Text>
      <View style={styles.progressBarContainer}>
        <View
          style={[styles.progressBar, { width: `${progressPercentage}%` }]}
        />
      </View>
      {currentStep === 1 && renderAdminDetails()}
      {currentStep === 2 && renderBusinesses()}
      {currentStep === 3 && renderUsers()}
      <View style={styles.navButtons}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        )}
        {currentStep < totalSteps ? (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => setCurrentStep(currentStep + 1)}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    textAlign: 'right',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6200ee',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 14,
    color: '#333',
    textAlign: 'left',
  },
  errorBorder: {
    borderColor: '#d32f2f',
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 12,
    color: '#d32f2f',
    marginBottom: 10,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    backgroundColor: '#ccc',
    padding: 15,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginLeft: 10,
  },
  nextButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  box: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  boxTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  removeButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});

export default AdminRegistration;
