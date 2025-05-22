import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import LanguageSwitcher from '../components/LanguageSwitcher';

export const LoginScreen = () => {
  const { signIn } = useAuth();
  const { t } = useTranslation();

  const handleLogin = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Login failed:', error);
    }  
  };

  return (
    <View style={styles.container}>
      <View style={styles.languageSwitcherContainer}>
        <LanguageSwitcher />
      </View>
      <Text style={styles.title} variant="headlineMedium">
        Welcome to RestMan
      </Text>
      <Text style={styles.subtitle} variant="bodyLarge">
        Your AI-powered restaurant equipment management assistant
      </Text>
      <Button
        mode="contained"
        onPress={handleLogin}
        style={styles.loginButton}
        icon="login"
      >
        {t('common.login')}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.7,
  },
  loginButton: {
    width: '100%',
    maxWidth: 300,
  },
  languageSwitcherContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
}); 