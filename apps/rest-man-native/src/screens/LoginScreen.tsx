import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';

export const LoginScreen = () => {
  const { signIn } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Login failed:', error);
    }  
  };

  return (
    <View style={styles.container}>
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
        Sign In
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
}); 