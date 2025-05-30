import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import ChatScreen from '../screens/ChatScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { TechniciansScreen } from '../screens/TechniciansScreen';
import { TechnicianDetailsScreen } from '../screens/TechnicianDetailsScreen';
import { IssueDetailsScreen } from '../screens/IssueDetailsScreen';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                title: 'Welcome',
                headerShown: false,
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ title: 'AI Assistant' }}
            />
            <Stack.Screen
              name="Technicians"
              component={TechniciansScreen}
              options={{ title: 'Technicians' }}
            />
            <Stack.Screen
              name="TechnicianDetails"
              component={TechnicianDetailsScreen}
              options={{ title: 'Technician Details' }}
            />
            <Stack.Screen
              name="IssueDetails"
              component={IssueDetailsScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
