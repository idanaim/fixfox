import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Chip, Divider } from 'react-native-paper';
import { getEnvironmentInfo, config, debugLog } from '../config/environment';

interface EnvironmentInfoProps {
  visible?: boolean;
}

export const EnvironmentInfo: React.FC<EnvironmentInfoProps> = ({ visible = false }) => {
  if (!visible && !config.DEBUG) {
    return null;
  }

  const envInfo = getEnvironmentInfo();

  const getStatusColor = () => {
    switch (config.ENVIRONMENT) {
      case 'development':
        return '#4CAF50'; // Green
      case 'staging':
        return '#FF9800'; // Orange
      case 'production':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Grey
    }
  };

  const testApiConnection = async () => {
    try {
      debugLog('Testing API connection...');
      const response = await fetch(`${config.API_BASE_URL}/health`);
      const data = await response.json();
      debugLog('API Health Check:', data);
      return response.ok;
    } catch (error) {
      debugLog('API Health Check Failed:', error);
      return false;
    }
  };

  React.useEffect(() => {
    if (config.DEBUG) {
      debugLog('Environment Info Component Mounted', envInfo);
      testApiConnection();
    }
  }, []);

  return (
    <Card style={styles.container}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={styles.title}>🔧 Environment Info</Text>
          <Chip 
            mode="outlined" 
            style={[styles.chip, { borderColor: getStatusColor() }]}
            textStyle={{ color: getStatusColor() }}
          >
            {config.ENVIRONMENT.toUpperCase()}
          </Chip>
        </View>

        <Divider style={styles.divider} />

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📱 App Configuration</Text>
            <Text style={styles.item}>Name: {config.APP_NAME}</Text>
            <Text style={styles.item}>Version: {config.VERSION}</Text>
            <Text style={styles.item}>Debug Mode: {config.DEBUG ? '✅' : '❌'}</Text>
            <Text style={styles.item}>Dev Mode: {envInfo.isDev ? '✅' : '❌'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌐 API Configuration</Text>
            <Text style={styles.item}>Base URL: {config.API_BASE_URL}</Text>
            <Text style={styles.item}>Timeout: {config.API_TIMEOUT}ms</Text>
            <Text style={styles.item}>Environment: {config.ENVIRONMENT}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔗 Quick Links</Text>
            <Text style={styles.link}>Health: {config.API_BASE_URL}/health</Text>
            <Text style={styles.link}>Docs: {config.API_BASE_URL}/docs</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧪 Environment Detection</Text>
            <Text style={styles.item}>
              Method: {envInfo.isDev ? 'Development Mode' : 'Build Environment'}
            </Text>
            <Text style={styles.item}>
              Build Env: {process.env.EXPO_PUBLIC_ENVIRONMENT || 'Not Set'}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 This panel is only visible in debug mode
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chip: {
    height: 28,
  },
  divider: {
    marginVertical: 8,
  },
  content: {
    maxHeight: 280,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  item: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  link: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'monospace',
    color: '#2196F3',
  },
  footer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
});

export default EnvironmentInfo; 