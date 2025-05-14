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
    <UsersManagement />
  );
}
