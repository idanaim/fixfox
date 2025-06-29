import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import he from './locales/he.json';

// Function to detect if text is Hebrew
export const isHebrew = (text: string): boolean => {
  const hebrewPattern = /[\u0590-\u05FF]/;
  return hebrewPattern.test(text);
};

// Function to detect the language of a text
export const detectLanguage = (text: string): string => {
  return isHebrew(text) ? 'he' : 'en';
};

// Get device language using expo-localization
const getDeviceLanguage = (): string => {
  try {
    const deviceLocales = Localization.getLocales();
    const deviceLanguage = deviceLocales[0]?.languageCode;
    return deviceLanguage === 'he' ? 'he' : 'en';
  } catch (error) {
    console.error('Error getting device language:', error);
    return 'en';
  }
};

const resources = {
  en: {
    translation: en,
  },
  he: {
    translation: he,
  },
};

// Initialize i18n synchronously with defaults
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

// Initialize i18n with saved preferences asynchronously
const initI18n = async () => {
  try {
    // Try to get the saved language preference
    const savedLanguage = await AsyncStorage.getItem('app_language');
    
    // If no saved language preference, try to use device language
    const deviceLanguage = getDeviceLanguage();
    const initialLanguage = savedLanguage || deviceLanguage;

    // Change language if different from default
    if (initialLanguage !== 'en') {
      i18n.changeLanguage(initialLanguage);
    }
  } catch (error) {
    console.error('Error initializing i18n:', error);
  }
};

// Initialize asynchronously
initI18n();

// Function to change the language
export const changeLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem('app_language', language);
    i18n.changeLanguage(language);
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
};

export default i18n; 