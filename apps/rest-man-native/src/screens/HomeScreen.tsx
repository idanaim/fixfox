import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../hooks/useAuth';
import { useBusiness } from '../hooks/useBusiness';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const { currentBusiness } = useBusiness();

  const handleSolvePress = () => {
    if (!user || !currentBusiness) return;
    
    navigation.navigate('Chat', {
      userId: user.id,
      businessId: currentBusiness.id,
    });
  };

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={handleSolvePress}
        style={styles.solveButton}
        icon="wrench"
        disabled={!user || !currentBusiness}
      >
        Solve Equipment Issue
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  solveButton: {
    marginTop: 16,
  },
});  