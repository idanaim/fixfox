import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useUserById } from '../../queries/react-query-wrapper/use-users';
import { styles } from './admin-dashboard-styles';
import { MaterialIcons } from '@expo/vector-icons';
import useAuthStore from '../../store/auth.store';
export function AdminSection() {
  const {user} =useAuthStore()
  const { data: admin = {} } = useUserById(user?.id);

  return (
    <View style={styles.adminCard}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <MaterialIcons name="admin-panel-settings" size={32} color="#fff" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.adminName}>{admin.name}</Text>
          <Text style={styles.adminRole}>System Administrator</Text>
        </View>
      </View>

      {/* Details Grid */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <MaterialIcons name="phone" size={20} color="#718096" />
          <Text style={styles.detailText}>
            {admin.mobile || 'Not provided'}
          </Text>
          <TouchableOpacity style={styles.AdminEditButton}>
            <MaterialIcons name="edit" size={18} color="#4299E1" />
          </TouchableOpacity>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="email" size={20} color="#718096" />
          <Text style={styles.detailText}>{admin.email}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.AdminActionButton}>
          <MaterialIcons name="security" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Reset Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.AdminActionButton}>
          <MaterialIcons name="notifications" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Notification Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
