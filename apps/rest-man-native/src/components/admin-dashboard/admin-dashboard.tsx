import React from 'react';
import { ScrollView, View } from 'react-native';
import { BusinessSection } from './business-section/business-section';
import { EmployeeSection } from './employee-section';
import { AdminSection } from './admin-section';
import {styles} from './admin-dashboard-styles'

export default function UsersManagement() {
  return (
    <ScrollView style={styles.container}>
      <AdminSection />
      <BusinessSection />
      <EmployeeSection />
    </ScrollView>
  );
}

