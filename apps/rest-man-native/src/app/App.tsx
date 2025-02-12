
import React, { useRef, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import ReactQueryWrapper from '../queries/react-query-wrapper/react-query-wrapper';
import { createStackNavigator } from '@react-navigation/stack';
import { MainContainer } from '../components/fixfox-container/fixfox-container';
import EmployeeRegisterWizard from '../components/admin-registration/test';
import AdminRegistration from '../components/admin-registration/admin-registration';
import { TicketForm } from '../components/ticket-form/ticket-form';
import LoginScreen from '../components/login/login';
import { PaperProvider } from 'react-native-paper';
import { theme } from './theme';
import UserForm from '../components/admin-dashboard/user-form/user-form';
import BusinessForm from '../components/admin-dashboard/business-form/business-form';

export const App = () => {
  const Stack = createStackNavigator();
  /**
   * This is the main entry point for the app
   * 1. Login Page - Who are you? Admin or Employee
   */
  return (
    <SafeAreaView style={{ flex: 1, padding:8}}>
    <ReactQueryWrapper onMfeRender={true}>
      <NavigationContainer>
        <Stack.Navigator>
          {/*<Stack.Screen name="Login"   options={{ headerShown: false }} component={LoginScreen} />*/}
          {/*<Stack.Screen name="Employee reg" component={AdminRegistration} />*/}
          <Stack.Screen name=" " component={MainContainer} />
          <Stack.Screen name="edit-business" component={ BusinessForm} />
          <Stack.Screen
            name="user-form"
            component={UserForm}
            options={{ title: 'Manage Permissions' }}
          />
          <Stack.Screen name="Add Ticket" component={TicketForm} />
        </Stack.Navigator>
      </NavigationContainer>
    </ReactQueryWrapper>
    </SafeAreaView>
  );
}
export default App;

