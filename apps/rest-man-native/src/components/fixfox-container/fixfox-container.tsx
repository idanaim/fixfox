import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TicketsManagement } from '../tickets-management/fixfox-tickets-management';
import UsersManagement from '../admin-dashboard/admin-dashboard';

// Main Admin Dashboard Component
export function MainContainer() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigation = useNavigation();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.container}>
        {/*/!* Header *!/*/}
        {/*<View style={styles.header}>*/}
        {/*  <Text style={styles.headerTitle}>FixFox</Text>*/}
        {/*</View>*/}

        {/* Navigation Bar */}
        <View style={styles.navContainer}>
          <TouchableOpacity
            style={[
              styles.navItem,
              activeTab === 'tickets' && styles.activeNav,
            ]}
            onPress={() => setActiveTab('tickets')}
          >
            <Text
              style={[
                styles.navText,
                activeTab === 'tickets' && styles.activeNavText,
              ]}
            >
              Tickets
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navItem,
              activeTab === 'dashboard' && styles.activeNav,
            ]}
            onPress={() => setActiveTab('dashboard')}
          >
            <Text
              style={[
                styles.navText,
                activeTab === 'dashboard' && styles.activeNavText,
              ]}
            >
              Dashboard
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Area */}

        <View style={styles.content}>
          {activeTab === 'tickets' ? (
            <TicketsManagement />
          ) : (
            <UsersManagementContainer />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

// Placeholder Users Management Component
function UsersManagementContainer() {
  return (
    <View style={styles.usersContainer}>
      <Text style={styles.sectionTitle}>User Management</Text>
      <UsersManagement />
    </View>
  );
}

// Updated Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    height: '100%',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333333',
  },
  navContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  navItem: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeNav: {
    borderBottomColor: '#6200EE',
  },
  navText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  activeNavText: {
    color: '#6200EE',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  usersContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 24,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200EE',
  },
});
