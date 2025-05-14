import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { Equipment } from '../api/chatAPI';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Surface, Divider } from 'react-native-paper';
import { colors, typography } from '../componentsBackup/admin-dashboard/admin-dashboard-styles';

interface ApplianceSelectorProps {
  equipmentList: Equipment[];
  onSelect: (equipment: Equipment) => void;
  onAddNew: () => void;
}

const ApplianceSelector: React.FC<ApplianceSelectorProps> = ({
  equipmentList,
  onSelect,
  onAddNew,
}) => {
  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <Icon name="devices" size={22} color={colors.primary} style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Equipment Selection</Text>
      </View>
      
      <Divider style={styles.divider} />
      
      <View style={styles.contentContainer}>
        <Text style={styles.matchingMessage}>
          Found {equipmentList.length} matching appliance{equipmentList.length !== 1 ? 's' : ''}
        </Text>
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {equipmentList.map((equipment) => (
            <TouchableOpacity
              key={equipment.id}
              style={styles.equipmentItem}
              onPress={() => onSelect(equipment)}
            >
              <View style={styles.equipmentIcon}>
                <Icon 
                  name={equipment.category === 'HVAC' ? 'air-conditioner' : 
                        equipment.category === 'Kitchen' ? 'stove' : 
                        equipment.category === 'Refrigeration' ? 'fridge' : 'devices'} 
                  size={22} 
                  color={colors.primary} 
                />
              </View>
              <View style={styles.equipmentInfo}>
                <Text style={styles.equipmentName}>
                  {equipment.manufacturer} {equipment.model}
                </Text>
                <Text style={styles.equipmentDetails}>
                  {equipment.category || 'Equipment'} • {equipment.status || 'Active'}
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.medium} />
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <TouchableOpacity style={styles.addNewButton} onPress={onAddNew}>
          <Icon name="plus-circle-outline" size={20} color={colors.primary} style={styles.addNewIcon} />
          <Text style={styles.addNewText}>Add New Equipment</Text>
        </TouchableOpacity>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.dark,
    flex: 1,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
  },
  contentContainer: {
    padding: 16,
    backgroundColor: colors.white,
  },
  matchingMessage: {
    ...typography.body2,
    color: colors.medium,
    marginBottom: 12,
  },
  scrollView: {
    maxHeight: 250,
  },
  scrollContent: {
    paddingVertical: 4,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    marginBottom: 8,
  },
  equipmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    ...typography.body1,
    color: colors.dark,
    marginBottom: 2,
  },
  equipmentDetails: {
    ...typography.caption,
    color: colors.medium,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addNewIcon: {
    marginRight: 8,
  },
  addNewText: {
    ...typography.button,
    color: colors.primary,
  },
});

export default ApplianceSelector;
