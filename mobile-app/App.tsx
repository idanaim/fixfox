import React, { useEffect } from 'react';
import {
  SafeAreaView,
  I18nManager,
} from 'react-native';
import ReactQueryWrapper from './src/queries/react-query-wrapper/react-query-wrapper';
import useAuthStore from './src/store/auth.store';
import { AppNavigator } from './src/app/app-navigator';
import { PaperProvider } from 'react-native-paper';
import { theme } from './src/app/theme';
// Import i18n setup - this will initialize i18n
import './src/i18n';
import { useTranslation } from 'react-i18next';

export const App = () => {
  const { checkAuth } = useAuthStore();
  const { i18n } = useTranslation();

  /**
   * This is the main entry point for the app
   * 1. Login Page - Who are you? Admin or Employee
   */
  useEffect(() => {
    checkAuth();
  }, []);

  // Handle RTL/LTR direction changes when language changes
  useEffect(() => {
    const isRTL = i18n.language === 'he';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
      // Reload the app to apply RTL/LTL changes
      // Note: This is a workaround as React Native doesn't support dynamic RTL changes
      // In a production app, you might want to show a message asking the user to restart the app
      // or implement a more sophisticated solution
      setTimeout(() => {
        // @ts-ignore
        if (global.reload) {
          // @ts-ignore
          global.reload();
        }
      }, 100);
    }
  }, [i18n.language]);

  return (
    <PaperProvider theme={theme}>
      <ReactQueryWrapper onMfeRender={true}>
        <AppNavigator />
      </ReactQueryWrapper>
    </PaperProvider>
  );
}

export default App; 