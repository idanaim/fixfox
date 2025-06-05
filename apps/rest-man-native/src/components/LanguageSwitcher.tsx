import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';
import { colors, typography } from './admin-dashboard/admin-dashboard-styles';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'he' : 'en';
    changeLanguage(newLanguage);
  };

  return (
    <TouchableOpacity onPress={toggleLanguage} style={styles.container}>
      <Text style={styles.text}>
        {currentLanguage === 'en' ? 'עברית' : 'English'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white for Slack style
  },
  text: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '500',
  },
});

export default LanguageSwitcher;
