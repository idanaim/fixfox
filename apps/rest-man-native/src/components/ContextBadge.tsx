import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialIcons as MaterialIconsType } from '@expo/vector-icons/build/Icons';

export type BadgeType = 'current_business' | 'other_business' | 'ai_generated';

interface ContextBadgeProps {
  type: BadgeType;
  customLabel?: string;
}

// Icon names supported by MaterialIcons
type IconName = keyof typeof MaterialIconsType.glyphMap;

const ContextBadge: React.FC<ContextBadgeProps> = ({ type, customLabel }) => {
  // Get badge details based on the type
  const getBadgeDetails = () => {
    switch (type) {
      case 'current_business':
        return {
          label: customLabel || 'Used before in this business',
          backgroundColor: '#4CAF50', // Green
          color: '#FFFFFF',
          icon: 'check-circle' as IconName
        };
      case 'other_business':
        return {
          label: customLabel || 'Other businesses use it',
          backgroundColor: '#2196F3', // Blue
          color: '#FFFFFF',
          icon: 'people' as IconName
        };
      case 'ai_generated':
        return {
          label: customLabel || 'AI Solution',
          backgroundColor: '#9C27B0', // Purple
          color: '#FFFFFF',
          icon: 'auto-awesome' as IconName
        };
      default:
        return {
          label: customLabel || 'Unknown',
          backgroundColor: '#757575', // Gray
          color: '#FFFFFF',
          icon: 'help-outline' as IconName
        };
    }
  };

  const badgeDetails = getBadgeDetails();

  // Add a glow effect based on the badge type
  const glowStyles = () => {
    const color = badgeDetails.backgroundColor;
    return {
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 5,
      elevation: 5,
    };
  };

  return (
    <View style={[
      styles.badge, 
      { backgroundColor: badgeDetails.backgroundColor },
      glowStyles()
    ]}>
      <MaterialIcons name={badgeDetails.icon} size={16} color={badgeDetails.color} style={styles.icon} />
      <Text style={[styles.text, { color: badgeDetails.color }]}>{badgeDetails.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
});

export default ContextBadge; 