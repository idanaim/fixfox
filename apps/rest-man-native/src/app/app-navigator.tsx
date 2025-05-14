// AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useAuthStore from '../store/auth.store';
import LoginScreen from '../componentsBackup/login/login';
import { MainContainer } from '../componentsBackup/fixfox-container/fixfox-container';
import UserForm from '../componentsBackup/admin-dashboard/user-form/user-form';
import { TicketForm } from '../componentsBackup/ticket-form/ticket-form';
import React, { useMemo } from 'react';
// import AdminRegistration from '../componentsBackupBackup/admin-registration/admin-registration';
import { ServerApi } from '../queries/server-api';
import { FixFoxProvidersContext } from '../store/fixfox-provider';
import BusinessForm from '../componentsBackup/admin-dashboard/business-form/business-form';
import ChatInterface from '../componentsBackup/ai-chat/ai-chat';
import  ChatScreen  from '../screens/ChatScreen';
import { AdminDashboard } from '../componentsBackup/tickets-management/reset-main-list';
import adminDashboard from '../componentsBackup/admin-dashboard/admin-dashboard';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { token,user, isLoading } = useAuthStore();
  console.log('Token:', token);
  const serverApi = useMemo(() => new ServerApi({ token }), [token]);

  return (
    <FixFoxProvidersContext.Provider value={{ serverApi ,user }}>
      <NavigationContainer>
        <Stack.Navigator>
          {token ? (
            <Stack.Screen
              options={{ headerShown: false }}
              name="Dashboard" component={adminDashboard} initialParams={{businessId:6,userId:user?.id}} />
          ) : (
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
          )}
            <Stack.Screen name="edit-business" component={ BusinessForm} />
            {/*<Stack.Screen*/}
            {/*  name="user-form"*/}
            {/*  component={UserForm}*/}
            {/*  options={{ title: 'Manage Permissions' }}*/}
            {/*/>     */}
          <Stack.Screen
              name="user-form"
              component={UserForm}
              options={{ title: 'Manage Permissions' }}
            />
            <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </FixFoxProvidersContext.Provider>
  );
};
