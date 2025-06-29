import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { getLocales } from 'react-native-localize';

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

// Get device language (fallback for Expo Go)
const getDeviceLanguage = (): string => {
  try {
    // Fallback to English when running in Expo Go
    // In a development build, you would use:
    // const deviceLocales = getLocales();
    // const deviceLanguage = deviceLocales[0]?.languageCode;
    // return deviceLanguage === 'he' ? 'he' : 'en';
    
    return 'en'; // Default to English for Expo Go
  } catch (error) {
    console.error('Error getting device language:', error);
    return 'en';
  }
};

// Initialize i18n
const initI18n = async () => {
  // Try to get the saved language preference
  let savedLanguage = null;
  try {
    savedLanguage = await AsyncStorage.getItem('app_language');
  } catch (error) {
    console.error('Error retrieving language preference:', error);
  }

  // If no saved language preference, try to use device language
  const deviceLanguage = getDeviceLanguage();
  const initialLanguage = savedLanguage || deviceLanguage;

  const resources = {
    en: {
      translation: en,
    },
    he: {
      translation: he,
    },
  };

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: 'en',
      debug: false,
      interpolation: {
        escapeValue: false,
      },
    });

  return i18n;
};

// Function to change the language
export const changeLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem('app_language', language);
    i18n.changeLanguage(language);
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
};

export default initI18n(); 