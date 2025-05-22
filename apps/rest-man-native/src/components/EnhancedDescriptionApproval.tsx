import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, I18nManager } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography } from '../componentsBackup/admin-dashboard/admin-dashboard-styles';
import { useTranslation } from 'react-i18next';

interface EnhancedDescriptionApprovalProps {
  originalDescription: string;
  enhancedDescription: string;
  onApprove: (description: string) => void;
  onReject: () => void;
}

const EnhancedDescriptionApproval: React.FC<EnhancedDescriptionApprovalProps> = ({
  originalDescription,
  enhancedDescription,
  onApprove,
  onReject,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon 
          name="magic" 
          size={24} 
          color={colors.primary} 
          style={isRTL ? styles.headerIconRTL : styles.headerIcon} 
        />
        <Text style={styles.title}>{t('chat.enhanced_description')}</Text>
        <Text style={styles.subtitle}>{t('chat.approve_description')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.descriptionSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('chat.original_description')}
            </Text>
          </View>
          <View style={styles.descriptionBox}>
            <Text style={[styles.descriptionText, { textAlign: isRTL ? 'right' : 'left' }]}>
              {originalDescription}
            </Text>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('chat.enhanced_description')}
            </Text>
            <View style={styles.badge}>
              <Icon name="star" size={12} color={colors.primary} />
              <Text style={[styles.badgeText, { marginLeft: isRTL ? 0 : 4, marginRight: isRTL ? 4 : 0 }]}>
                {t('chat.ai_enhanced')}
              </Text>
            </View>
          </View>
          <View style={[styles.descriptionBox, styles.enhancedBox]}>
            <Text style={[styles.descriptionText, { textAlign: isRTL ? 'right' : 'left' }]}>
              {enhancedDescription}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, styles.rejectButton]} 
          onPress={onReject}
        >
          <Text style={styles.rejectButtonText}>{t('common.use_original')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.approveButton]} 
          onPress={() => onApprove(enhancedDescription)}
        >
          <Text style={styles.approveButtonText}>{t('common.use_enhanced')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    margin: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 8,
  },
  headerIconRTL: {
    marginBottom: 8,
  },
  title: {
    ...typography.h3,
    color: colors.dark,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body2,
    color: colors.medium,
    textAlign: 'center',
  },
  content: {
    maxHeight: 300,
    padding: 16,
  },
  descriptionSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    ...typography.body1,
    fontWeight: '500',
    color: colors.dark,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  descriptionBox: {
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  enhancedBox: {
    backgroundColor: colors.primary + '08',
    borderColor: colors.primary + '20',
  },
  descriptionText: {
    ...typography.body2,
    color: colors.dark,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  rejectButton: {
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.border,
  },
  approveButton: {
    backgroundColor: colors.primary,
  },
  rejectButtonText: {
    ...typography.button,
    color: colors.dark,
  },
  approveButtonText: {
    ...typography.button,
    color: colors.white,
  },
});

export default EnhancedDescriptionApproval; 