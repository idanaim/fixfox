import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import useRegisterEmployee from '../../queries/use-save-admin-reg';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';

export const EmployeeRegisterWizard = () => {
  const { mutate, isPending, isError, error, isSuccess } = useRegisterEmployee();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
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
      { name: '', address: '', type: '' },
    ]);
  };

  const addUser = () => {
    const users = watch('users');
    setValue('users', [...users, { name: '', email: '', mobile: '' }]);
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
    mutate(data, {
      onSuccess: () => {
        reset(); // Reset the form after successful submission
      },
    });
  };

  // Render form steps (same as before)
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
            placeholder="Enter admin name"
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
            placeholder="Enter admin email"
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
            placeholder="Enter admin password"
            value={value}
            onChangeText={onChange}
            secureTextEntry={true}
          />
        )}
      />
      {errors.admin?.password && (
        <Text style={styles.errorText}>{errors.admin.password.message}</Text>
      )}
      <Text style={styles.label}>Admin Mobile</Text>
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
            placeholder="Enter mobile number"
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
                  placeholder="Enter business name"
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
                  placeholder="Enter business address"
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
                  placeholder="Enter user name"
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
                  placeholder="Enter user email"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            <Text style={styles.label}>User Mobile</Text>
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
                  placeholder="Enter user mobile"
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
 export const RobotIcon = () => (
    <Svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="25" y="15" width="50" height="40" rx="8" fill="#FFD700"/>
      <Circle cx="35" cy="30" r="5" fill="white"/>
      <Circle cx="65" cy="30" r="5" fill="white"/>
      <Circle cx="35" cy="30" r="2" fill="black"/>
      <Circle cx="65" cy="30" r="2" fill="black"/>
      <Path d="M30 40 Q50 50, 70 40" stroke="black" fill="transparent"/>
      <Line x1="50" y1="15" x2="50" y2="5" stroke="black" strokeWidth="2"/>
      <Circle cx="50" cy="5" r="3" fill="black"/>
      <Line x1="72" y1="55" x2="90" y2="73" stroke="gray" strokeWidth="4"/>
      <Line x1="90" y1="73" x2="88" y2="75" stroke="gray" strokeWidth="4"/>
      <Line x1="90" y1="73" x2="92" y2="75" stroke="gray" strokeWidth="4"/>
      <Rect x="35" y="55" width="30" height="30" rx="5" fill="#FFD700"/>
      <Rect x="35" y="85" width="12" height="10" rx="3" fill="#FFD700"/>
      <Rect x="53" y="85" width="12" height="10" rx="3" fill="#FFD700"/>
    </Svg>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconContainer}>
        <RobotIcon />
      </View>
      <Text style={styles.title}>Employee Registration Wizard</Text>
      <View style={styles.progressBarContainer}>
        <View
          style={[styles.progressBar, { width: `${progressPercentage}%` }]}
        />
      </View>
      {currentStep === 1 && renderAdminDetails()}
      {currentStep === 2 && renderBusinesses()}
      {currentStep === 3 && renderUsers()}
      {isSuccess && (
        <Text style={styles.successText}>Wizard data saved successfully!</Text>
      )}
      {isError && (
        <Text style={styles.errorText}>
          Error: {error.message || 'Failed to save wizard data'}
        </Text>
      )}
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
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Submit</Text>
            )}
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6200ee',
  },
  successText:{
    color: '#28a745',
    fontSize: 16,
    marginBottom: 10,
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
    marginRight: 10,
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

export default EmployeeRegisterWizard;
