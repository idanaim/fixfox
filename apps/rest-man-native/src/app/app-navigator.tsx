// AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useAuthStore from '../store/auth.store';
import LoginScreen from '../componentsBackup/login/login';
import UserForm from '../componentsBackup/admin-dashboard/user-form/user-form';
import React, { useMemo } from 'react';
// import AdminRegistration from '../componentsBackupBackup/admin-registration/admin-registration';
import { ServerApi } from '../queries/server-api';
import { FixFoxProvidersContext } from '../store/fixfox-provider';
import BusinessForm from '../componentsBackup/admin-dashboard/business-form/business-form';
import ChatScreen from '../screens/ChatScreen';
import { TechniciansScreen } from '../screens/TechniciansScreen';
import { TechnicianDetailsScreen } from '../screens/TechnicianDetailsScreen';
import adminDashboard from '../componentsBackup/admin-dashboard/admin-dashboard';
import { IssueDetailsScreen } from '../screens/IssueDetailsScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { token, user, isLoading } = useAuthStore();
  console.log('Token:', token);
  const serverApi = useMemo(() => new ServerApi({ token }), [token]);

  return (
    <FixFoxProvidersContext.Provider value={{ serverApi, user }}>
      <NavigationContainer>
        <Stack.Navigator>
          {token ? (
            <>
              <Stack.Screen
                options={{ headerShown: false }}
                name="Dashboard"
                component={adminDashboard}
                initialParams={{ businessId: 6, userId: user?.id }}
              />
              <Stack.Screen name="edit-business" component={BusinessForm} />
              <Stack.Screen
                name="user-form"
                component={UserForm}
                options={{ title: 'Create User', headerShown: false }}
              />
              <Stack.Screen
                options={{ headerShown: false }}
                name="Technicians"
                component={TechniciansScreen}
              />
              <Stack.Screen
                options={{ headerShown: false }}
                name="TechnicianDetails"
                component={TechnicianDetailsScreen}
              />
              <Stack.Screen
                name="IssueDetails"
                component={IssueDetailsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                options={{ headerShown: false }}
                name="Chat"
                component={ChatScreen}
              />
            </>
          ) : (
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </FixFoxProvidersContext.Provider>
  );
};
