import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TechnicianCard = ({ name, rating, availability }) => {
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Ionicons key={i} name="star-half" size={16} color="#FFD700" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={16} color="#FFD700" />);
      }
    }

    return stars;
  };

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: 'https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 70) }}
        style={styles.avatar}
      />

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>

        <View style={styles.ratingContainer}>
          {renderStars()}
          <Text style={styles.ratingText}>({rating.toFixed(1)})</Text>
        </View>

        <View style={[
          styles.availabilityBadge,
          availability ? styles.available : styles.unavailable
        ]}>
          <Ionicons
            name={availability ? 'checkmark-circle' : 'close-circle'}
            size={14}
            color="white"
          />
          <Text style={styles.availabilityText}>
            {availability ? 'Available Now' : 'Unavailable'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.bookButton}>
        <Text style={styles.bookButtonText}>Book</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  available: {
    backgroundColor: '#4CAF50',
  },
  unavailable: {
    backgroundColor: '#F44336',
  },
  availabilityText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  bookButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  bookButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default TechnicianCard;
