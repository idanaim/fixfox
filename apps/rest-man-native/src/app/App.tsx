import React, { useEffect} from 'react';
import {
  SafeAreaView,
} from 'react-native';
import ReactQueryWrapper from '../queries/react-query-wrapper/react-query-wrapper';
import useAuthStore from '../store/auth.store';
import { AppNavigator } from './app-navigator';
import { PaperProvider } from 'react-native-paper';
import { theme } from './theme';
// import { AppNavigator } from './app-navigator';
// import AIChatScreen from '../componentsBackup/ai-chat/ai-chat';

export const App = () => {
  const { checkAuth } = useAuthStore();
  /**
   * This is the main entry point for the app
   * 1. Login Page - Who are you? Admin or Employee
   */
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <ReactQueryWrapper onMfeRender={true}>
        <AppNavigator />
      </ReactQueryWrapper>
    </PaperProvider>
  );
}

export default App;

