import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IssueTicketList } from '../components/ticket-management/IssueTicketList';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // For demo purposes, using hardcoded values
  // In a real app, these would come from authentication/context
  const businessId = 6;
  const userId = 22;

  return (
    <View style={styles.container}>
      <IssueTicketList
        businessId={businessId}
        userId={userId}
        navigation={navigation}
        onIssuePress={(issue) => {
          navigation.navigate('IssueDetails', {
            issueId: issue.id,
            businessId,
            userId,
          });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
