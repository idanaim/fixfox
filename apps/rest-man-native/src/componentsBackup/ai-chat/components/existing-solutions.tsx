import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/chat-styles';
import { Button } from 'react-native-paper';

interface ExistingSolutionsProps {
  solutions: any[];
  onUseSolution: (solution: string) => void;
  onGenerateNew: () => void;
}

const ExistingSolutions = ({ solutions, onUseSolution, onGenerateNew }: ExistingSolutionsProps) => (
  <View style={styles.solutionsContainer}>
    <Text style={styles.solutionsTitle}>Existing Solutions:</Text>
    {solutions.map((solution, index) => (
      <TouchableOpacity
        key={index}
        style={styles.solutionCard}
        onPress={() => onUseSolution(solution.solution)}
      >
        <Text style={styles.solutionProblem}>{solution.problem}</Text>
        <Text numberOfLines={2} style={styles.solutionText}>
          {solution.solution}
        </Text>
      </TouchableOpacity>
    ))}
    <Button onPress={onGenerateNew}>
      Generate New Solution
    </Button>
  </View>
);

export default ExistingSolutions;
