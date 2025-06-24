import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Card, Chip, Button, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { api } from '../api/api';
import { useTechnicianById } from '../components/technician/queries/technicians-query';

type TechnicianDetailsRouteProp = RouteProp<RootStackParamList, 'TechnicianDetails'>;

interface Rating {
  rating_id: string;
  response_time: number;
  price: number;
  quality_accuracy: number;
  professionalism: number;
  efficiency: number;
  aesthetics: number;
  review_comment?: string;
}

interface Location {
  location_id: string;
  city: string;
  area: string;
}


export const TechnicianDetailsScreen = () => {
  const { t } = useTranslation();
  const route = useRoute<TechnicianDetailsRouteProp>();
  const { id } = route.params;

  const {data:technician, isLoading, error} = useTechnicianById(id);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !technician) {
    return (
      <View style={styles.centered}>
        <Text>Error loading technician details</Text>
      </View>
    );
  }

  const getAverageRating = (ratings: Rating[]) => {
    if (!ratings.length) return 0;
    const sum = ratings.reduce((acc: number, r: Rating) =>
      acc + (r.response_time + r.price + r.quality_accuracy + r.professionalism + r.efficiency + r.aesthetics) / 6, 0);
    return sum / ratings.length;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: technician.image }}
          style={styles.image}
        />
        <View style={styles.headerInfo}>
          <Text variant="headlineMedium">{technician.name}</Text>
          <Text variant="titleMedium">
            {t(`technician.serviceType.${technician.service_type}`)}
          </Text>
          {technician.ratings.length > 0 && (
            <Text variant="bodyLarge">
              Rating: {getAverageRating(technician.ratings).toFixed(1)}/5
            </Text>
          )}
        </View>
      </View>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('technician.professions.title')}
          </Text>
          <View style={styles.professions}>
            {technician.professions.map((profession: string) => (
              <Chip key={profession} style={styles.chip}>
                {t(`technician.professions.${profession}`)}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('technician.locations')}
          </Text>
          {technician.locations.map((location: Location) => (
            <Text key={location.location_id} variant="bodyLarge" style={styles.location}>
              {location.city}, {location.area}
            </Text>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('technician.contact')}
          </Text>
          <Text variant="bodyLarge">{technician.mobile}</Text>
          <Text variant="bodyLarge">{technician.address}</Text>
        </Card.Content>
      </Card>

      {technician.ratings.length > 0 && (
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t('technician.reviews')}
            </Text>
            {technician.ratings.map((rating: Rating) => (
              <View key={rating.rating_id} style={styles.review}>
                <View style={styles.ratingRow}>
                  <Text variant="bodyMedium">
                    Response Time: {rating.response_time}/5
                  </Text>
                  <Text variant="bodyMedium">
                    Price: {rating.price}/5
                  </Text>
                </View>
                <View style={styles.ratingRow}>
                  <Text variant="bodyMedium">
                    Quality: {rating.quality_accuracy}/5
                  </Text>
                  <Text variant="bodyMedium">
                    Professionalism: {rating.professionalism}/5
                  </Text>
                </View>
                <View style={styles.ratingRow}>
                  <Text variant="bodyMedium">
                    Efficiency: {rating.efficiency}/5
                  </Text>
                  <Text variant="bodyMedium">
                    Aesthetics: {rating.aesthetics}/5
                  </Text>
                </View>
                {rating.review_comment && (
                  <Text variant="bodyMedium" style={styles.comment}>
                    {rating.review_comment}
                  </Text>
                )}
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => {}}
          style={styles.button}
        >
          {t('technician.contact')}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  section: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  professions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  location: {
    marginBottom: 8,
  },
  review: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  comment: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  actions: {
    padding: 16,
  },
  button: {
    marginBottom: 16,
  },
});
