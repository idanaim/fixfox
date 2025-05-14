// components/ChatHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Avatar } from 'react-native-paper';
import BusinessSwitcher from './BusinessSwitcher';
import { Business } from '../Types/business';
import { colors, typography } from '../../../componentsBackup/admin-dashboard/admin-dashboard-styles';

interface ChatHeaderProps {
  title: string;
  businesses: Business[];
  selectedBusiness: Business | null;
  onSelectBusiness: (business: Business) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  businesses,
  selectedBusiness,
  onSelectBusiness,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* User Avatar */}
        <View style={styles.avatarContainer}>
          <Avatar.Text 
            size={40} 
            label="AI" 
            style={styles.avatar}
            color={colors.white}
            labelStyle={styles.avatarLabel}
          />
        </View>

        {/* Title/Chat Name */}
        <Text style={styles.title}>{title}</Text>

        {/* Business Switcher */}
        <BusinessSwitcher
          businesses={businesses}
          selectedBusiness={selectedBusiness}
          onSelectBusiness={onSelectBusiness}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 8,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    backgroundColor: colors.primary,
  },
  avatarLabel: {
    ...typography.h3,
    fontWeight: '700',
  },
  title: {
    ...typography.h2,
    color: colors.dark,
    flex: 1,
  },
});

export default ChatHeader;
