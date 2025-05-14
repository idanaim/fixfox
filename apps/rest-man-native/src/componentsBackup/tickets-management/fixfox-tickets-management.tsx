import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import { Card, Text, Chip, Divider, Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography } from '../admin-dashboard/admin-dashboard-styles';

export function TicketsManagement() {
  const [expanded, setExpanded] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState('All');
  const navigation = useNavigation();

  const tickets = Array.from({ length: 150 }, (_, index) => ({
    _id: index + 1,
    title: `Ticket #${index + 1} - Equipment Issue`,
    assignee: `Assignee ${index + 1}`,
    status: ["Open", "In Progress", "Closed"][index % 3],
    priority: ["Low", "Medium", "High"][index % 3],
    description: `This is a detailed description for ticket ${index + 1}. It explains the issue in detail and provides context for the maintenance team.`,
    created: new Date(),
    updated: new Date(),
    equipmentDetails: `Equipment Type: ${['Refrigerator', 'Oven', 'Dishwasher'][index % 3]}\nManufacturer: ${['Brand A', 'Brand B', 'Brand C'][index % 3]}\nModel: ${['Model X', 'Model Y', 'Model Z'][index % 3]}`,
  }));

  const filteredTickets = tickets?.filter(
    (ticket) =>
      (selectedStatus === 'All' || ticket.status === selectedStatus) &&
      (ticket.title.toLowerCase().includes(filterText.toLowerCase()) ||
        ticket.description.toLowerCase().includes(filterText.toLowerCase()))
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return colors.success;
      case 'In Progress':
        return colors.accent;
      case 'Closed':
        return colors.medium;
      case 'Low':
        return colors.secondary;
      case 'Medium':
        return colors.accent;
      case 'High':
        return colors.error;
      default:
        return colors.medium;
    }
  };

  const renderStatusChip = (status) => (
    <Chip
      style={[
        styles.statusChip,
        { backgroundColor: getStatusColor(status) + '15' }
      ]}
      textStyle={{ 
        color: getStatusColor(status),
        ...typography.caption,
        fontWeight: '500',
      }}
    >
      {status}
    </Chip>
  );

  const renderItem = ({ item }) => (
    <Surface style={styles.card}>
      <TouchableOpacity
        onPress={() => setExpanded(expanded === item._id ? null : item._id)}
        style={styles.cardContent}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.assigneeContainer}>
              <Icon name="account" size={14} color={colors.medium} />
              <Text style={styles.metaText}>{item.assignee}</Text>
            </View>
          </View>
          {renderStatusChip(item.priority)}
        </View>

        <Divider style={styles.divider} />

        <View style={styles.cardBody}>
          <View style={styles.metaRow}>
            <View style={styles.dateContainer}>
              <Icon name="calendar-blank" size={14} color={colors.medium} />
              <Text style={styles.metaText}>
                {new Date(item.created).toLocaleDateString()}
              </Text>
            </View>
            {renderStatusChip(item.status)}
          </View>

          {expanded === item._id && (
            <View style={styles.expandedContent}>
              <Divider style={styles.divider} />
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Equipment Details</Text>
                <Text style={styles.description}>{item.equipmentDetails}</Text>
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.primaryActionButton]}
                  onPress={() => {}}
                >
                  <Icon name="comment-outline" size={16} color={colors.white} />
                  <Text style={styles.actionButtonText}>Comment</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.secondaryActionButton]}
                  onPress={() => {}}
                >
                  <Icon name="check" size={16} color={colors.dark} />
                  <Text style={[styles.actionButtonText, { color: colors.dark }]}>Resolve</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        {['All', 'Open', 'In Progress', 'Closed'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              selectedStatus === status && styles.activeFilterButton
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedStatus === status && styles.activeFilterButtonText
            ]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={colors.medium} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tickets..."
          placeholderTextColor={colors.medium}
          value={filterText}
          onChangeText={setFilterText}
        />
      </View>
      
      <FlatList
        data={filteredTickets}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeFilterButton: {
    borderBottomColor: colors.primary,
  },
  filterButtonText: {
    ...typography.body2,
    color: colors.medium,
  },
  activeFilterButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    ...typography.body1,
    color: colors.dark,
  },
  listContainer: {
    padding: 12,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    ...typography.h3,
    color: colors.dark,
    marginBottom: 4,
  },
  assigneeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...typography.caption,
    color: colors.medium,
    marginLeft: 4,
  },
  statusChip: {
    height: 24,
    borderRadius: 12,
  },
  cardBody: {
    marginTop: 8,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "center",
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: 12,
  },
  expandedContent: {
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: 8,
  },
  description: {
    ...typography.body2,
    color: colors.dark,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 8,
  },
  primaryActionButton: {
    backgroundColor: colors.primary,
  },
  secondaryActionButton: {
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonText: {
    ...typography.button,
    color: colors.white,
    marginLeft: 4,
    fontSize: 12,
  }
});
