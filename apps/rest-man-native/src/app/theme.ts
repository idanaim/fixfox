import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',  // Main brand color
    accent: '#03dac4',   // Secondary color
    background: '#f5f5f5',
    surface: '#ffffff',
    error: '#b00020',
    text: '#000000',
    disabled: '#a8a8a8',
  },
  fonts: {
    regular: 'Roboto-Regular',
    medium: 'Roboto-Medium',
    light: 'Roboto-Light',
    thin: 'Roboto-Thin',
  },
  roundness: 8,
};
