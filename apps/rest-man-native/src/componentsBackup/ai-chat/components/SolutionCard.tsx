import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

const SolutionCard = ({ cause, steps, effectiveness }) => (
  <Animated.View
    style={styles.solutionCard}
    entering={FadeIn.duration(500)}
  >
    <View style={styles.solutionHeader}>
      <MaterialIcons name="handyman" size={24} color="#4CAF50" />
      <Text style={styles.solutionTitle}>Recommended Solution</Text>
      <View style={styles.ratingBadge}>
        <Text style={styles.ratingText}>{effectiveness}% Success</Text>
      </View>
    </View>

    <Text style={styles.causeText}>{cause}</Text>

    {steps.map((step, i) => (
      <View key={i} style={styles.stepContainer}>
        <Text style={styles.stepNumber}>{i + 1}.</Text>
        <Text style={styles.stepText}>{step}</Text>
      </View>
    ))}

    <TouchableOpacity style={styles.helpButton}>
      <Text style={styles.helpText}>Still Having Trouble?</Text>
    </TouchableOpacity>
  </Animated.View>
);

const styles = StyleSheet.create({
  solutionCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  solutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  solutionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  ratingBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 'auto',
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  causeText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stepNumber: {
    fontWeight: 'bold',
    marginRight: 8,
    color: '#4A90E2',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  helpButton: {
    marginTop: 12,
    padding: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  helpText: {
    color: '#4A90E2',
    fontWeight: '600',
  }
});

export default SolutionCard;
