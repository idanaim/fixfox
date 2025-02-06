
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
import AdminRegisterWizard from '../components/admin-registration/Admin-register-wizard';
import { TicketForm } from '../components/ticket-form/ticket-form';
import LoginScreen from '../components/login/login';
import { PaperProvider } from 'react-native-paper';
import { theme } from './theme';

export const App = () => {
  const scrollViewRef = useRef<null | ScrollView>(null);
  const Stack = createStackNavigator();
  /**
   * This is the main entry point for the app
   * 1. Login Page - Who are you? Admin or Employee
   */
  return (
    <ReactQueryWrapper onMfeRender={true}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login"   options={{ headerShown: false }} component={LoginScreen} />
          {/*<Stack.Screen name="Employee reg" component={AdminRegisterWizard} />*/}
          <Stack.Screen name=" " component={MainContainer} />
          <Stack.Screen name="Add Ticket" component={TicketForm} />
        </Stack.Navigator>
      </NavigationContainer>
    </ReactQueryWrapper>
  );
}
export default App;
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
});
