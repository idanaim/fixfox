import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Text, Card, Chip, Searchbar, Avatar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTechnicians } from './queries/technicians-query';
import { Technician } from './interfaces/Technician';

const getInitials = (name: string) => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const TechniciansList = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfessions, setSelectedProfessions] = useState<string[]>([]);

  const { data: technicians, isLoading, error } = useTechnicians();

  const filteredTechnicians = useMemo(() => {
    if (!technicians) return [];
    return technicians.filter(tech => {
      const matchesSearch = tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.professions.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesProfessions = selectedProfessions.length === 0 ||
        selectedProfessions.every(p => tech.professions.includes(p));
      return matchesSearch && matchesProfessions;
    });
  }, [technicians, searchQuery, selectedProfessions]);

  const getAverageRating = (ratings: Technician['ratings']) => {
    if (!ratings.length) return 0;
    const sum = ratings.reduce((acc, r) =>
      acc + (r.response_time + r.price + r.quality_accuracy + r.professionalism + r.efficiency + r.aesthetics) / 6, 0);
    return sum / ratings.length;
  };

  const renderTechnician = ({ item }: { item: Technician }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('TechnicianDetails', { id: item.technician_id })}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            {!item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.image}
              />
            ) : (
              <Avatar.Text
                size={60}
                label={getInitials(item.name)}
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
              />
            )}
            <View style={styles.headerInfo}>
              <Text variant="titleMedium">{item.name}</Text>
              <Text variant="bodyMedium">
                {t(`technician.serviceType.${item.service_type}`)}
              </Text>
            </View>
          </View>

          <View style={styles.professions}>
            {item.professions.map(profession => (
              <Chip
                key={profession}
                style={styles.chip}
                onPress={() => {
                  setSelectedProfessions(prev =>
                    prev.includes(profession)
                      ? prev.filter(p => p !== profession)
                      : [...prev, profession]
                  );
                }}
              >
                {t(`technician.professions.${profession}`)}
              </Chip>
            ))}
          </View>

          <View style={styles.location}>
            <Text variant="bodyMedium">
              {item.locations.map(loc => `${loc.city}, ${loc.area}`).join(' • ')}
            </Text>
          </View>

          <View style={styles.contact}>
            <Text variant="bodyMedium">{item.mobile}</Text>
            <Text variant="bodyMedium">{item.address}</Text>
          </View>

          {item.ratings.length > 0 && (
            <View style={styles.rating}>
              <Text variant="bodyMedium">
                Rating: {getAverageRating(item.ratings).toFixed(1)}/5
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('common.error')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={t('technician.searchPlaceholder')}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['electrician', 'plumber', 'hvac_technician', 'appliance_technician'].map((profession) => (
            <Chip
              key={profession}
              selected={selectedProfessions.includes(profession)}
              onPress={() => {
                setSelectedProfessions(prev =>
                  prev.includes(profession)
                    ? prev.filter(p => p !== profession)
                    : [...prev, profession]
                );
              }}
              style={styles.filterChip}
            >
              {t(`technician.professions.${profession}`)}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredTechnicians}
        renderItem={renderTechnician}
        keyExtractor={item => item.technician_id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  avatar: {
    marginRight: 12,
    backgroundColor: '#6200ee',
  },
  avatarLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
  },
  professions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  location: {
    marginBottom: 8,
  },
  contact: {
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
