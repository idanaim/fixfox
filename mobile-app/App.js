import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';

export default function App() {
  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.title}>FixFox Mobile</Text>
        <Text style={styles.subtitle}>Standalone Expo SDK 53</Text>
        <Text style={styles.info}>✅ Successfully ejected from NX monorepo</Text>
        <Text style={styles.info}>✅ Using latest Expo SDK 53</Text>
        <Text style={styles.info}>✅ New Architecture enabled</Text>
        <StatusBar style="auto" />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
    color: '#4CAF50',
  },
});
