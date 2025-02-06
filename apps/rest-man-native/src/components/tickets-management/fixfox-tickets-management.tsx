import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Card, Text, FAB } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

export function TicketsManagement() {
  const [expanded, setExpanded] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState('All');
  const navigation = useNavigation();

  const tickets= Array.from({ length: 150 }, (_, index) => ({
    _id: index + 1,
    title: `Ticket Title ${index + 1}`,
    assignee: `Assignee ${index + 1}`,
    status: ["Open", "In Progress", "Closed"][index % 3],
    priority: ["Low", "Medium", "High"][index % 3],
    description: `Description for ticket ${index + 1}`,
    created: new Date(),
    updated: new Date(),
    equipmentDetails: `Equipment details for ticket ${index + 1}`,
  }));

  const filteredTickets = tickets?.filter(
    (ticket) =>
      (selectedStatus === 'All' || ticket.status === selectedStatus) &&
      (ticket.title.toLowerCase().includes(filterText.toLowerCase()) ||
        ticket.description.toLowerCase().includes(filterText.toLowerCase()))
  );

  const statusColors = {
    Open: '#4CAF50',
    'In Progress': '#FF9800',
    Closed: '#9E9E9E',
    Low: '#2196F3',
    Medium: '#FF9800',
    High: '#F44336',
  };

  const renderStatusBadge = (status) => (
    <View style={[styles.statusBadge, { backgroundColor: statusColors[status] + '22' }]}>
      <Text style={[styles.statusBadgeText, { color: statusColors[status] }]}>
        {status}
      </Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <TouchableOpacity
          onPress={() => setExpanded(expanded === item._id ? null : item._id)}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.metaText}>
                <MaterialIcons name="person" size={14} color="#666" />
                {' '}{item.assignee}
              </Text>
            </View>
            {renderStatusBadge(item.priority)}
          </View>

          <View style={styles.cardBody}>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                <MaterialIcons name="calendar-today" size={14} color="#666" />
                {' '}{new Date(item.created).toLocaleDateString()}
              </Text>
              {renderStatusBadge(item.status)}
            </View>

            {expanded === item._id && (
              <View style={styles.expandedContent}>
                <Text style={styles.sectionTitle}>Equipment Details</Text>
                <Text style={styles.description}>{item.equipmentDetails}</Text>

                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>

      <View style={styles.navBar}>
        {['All', 'Open', 'In Progress', 'Closed'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.navButton,
              selectedStatus === status && styles.activeNavButton
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text style={[
              styles.navButtonText,
              selectedStatus === status && styles.activeNavButtonText
            ]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#666" />
          <TextInput
            style={styles.filterInput}
            placeholder="Search tickets..."
            placeholderTextColor="#999"
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

      <FAB
        style={styles.fab}
        icon="plus"
        color="#fff"
        onPress={() => navigation.navigate('Add Ticket')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#6200EE',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  metaText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 5,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 2,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeNavButton: {
    borderBottomColor: '#6200EE',
  },
  navButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeNavButtonText: {
    color: '#6200EE',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  card: {
    margin: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardBody: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  expandedContent: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200EE',
  },
  iconButton: {
    padding: 4,
    borderRadius: 20,
  },
});
