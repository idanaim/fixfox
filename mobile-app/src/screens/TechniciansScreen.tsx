import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Appbar } from 'react-native-paper';
import { TechniciansList } from '../components/technician/TechniciansList';

export const TechniciansScreen = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title={t('technician.title')} />
        <Appbar.Action icon="plus" onPress={() => {}} />
      </Appbar.Header>
      <TechniciansList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 