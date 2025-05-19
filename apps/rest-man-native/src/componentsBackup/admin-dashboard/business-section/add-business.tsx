// Add this modal to your JSX
import React, { useState } from 'react';
import {
  View,
  Modal,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  I18nManager,
} from 'react-native';
import { TextInput, Button, IconButton, Surface, Divider } from 'react-native-paper';
import { colors, typography, styles as globalStyles } from '../admin-dashboard-styles';
import { useCreateBusiness } from '../../../queries/react-query-wrapper/use-get-business';
import useAuthStore from '../../../store/auth.store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

interface AddBusinessModalProps {
  isAddBusinessModalVisible: boolean;
  setAddBusinessModalVisible: (visible: boolean) => void;
}

export function AddBusinessModal({
  isAddBusinessModalVisible,
  setAddBusinessModalVisible,
}: AddBusinessModalProps) {
  const { user } = useAuthStore();
  const { mutate: createBusiness, isPending } = useCreateBusiness();
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const { t, i18n } = useTranslation();

  const handleAddBusiness = () => {
    if (!name || !type || !user?.accountId) return;

    createBusiness({
      name,
      type,
      address,
      mobile,
      accountId: user.accountId,
    }, {
      onSuccess: () => {
        resetFormAndClose();
      }
    });
  };

  const resetFormAndClose = () => {
    setName('');
    setType('');
    setAddress('');
    setMobile('');
    setAddBusinessModalVisible(false);
  };

  const isFormValid = name.trim() !== '' && type.trim() !== '';

  return (
    <Modal
      visible={isAddBusinessModalVisible}
      onDismiss={() => setAddBusinessModalVisible(false)}
      animationType="slide"
      transparent={true}
    >
      <SafeAreaView style={styles.modalContainer}>
        <Surface style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.headerContent}>
              <Icon name="domain" size={24} color={colors.primary} />
              <Text style={styles.modalTitle}>{t('admin.businessForm.addNewBusiness')}</Text>
            </View>
            <IconButton
              icon="close"
              size={20}
              onPress={resetFormAndClose}
              style={styles.closeButton}
            />
          </View>
          <Divider />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.formContainer}
          >
            <ScrollView>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('admin.businessForm.businessName')} *</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  mode="outlined"
                  placeholder={t('admin.businessForm.enterBusinessName')}
                  style={styles.input}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  left={<TextInput.Icon icon="domain" color={colors.medium} />}
                  textAlign={i18n.language === 'he' ? 'right' : 'left'}
                  theme={{ roundness: 8 }}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('admin.businessForm.businessType')} *</Text>
                <TextInput
                  value={type}
                  onChangeText={setType}
                  mode="outlined"
                  placeholder={t('admin.businessForm.enterType')}
                  style={styles.input}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  left={<TextInput.Icon icon="store" color={colors.medium} />}
                  textAlign={i18n.language === 'he' ? 'right' : 'left'}
                  theme={{ roundness: 8 }}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('admin.businessForm.address')}</Text>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  mode="outlined"
                  placeholder={t('admin.businessForm.enterAddress')}
                  style={styles.input}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  left={<TextInput.Icon icon="map-marker" color={colors.medium} />}
                  multiline
                  numberOfLines={2}
                  textAlign={i18n.language === 'he' ? 'right' : 'left'}
                  theme={{ roundness: 8 }}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('admin.businessForm.phoneNumber')}</Text>
                <TextInput
                  value={mobile}
                  onChangeText={setMobile}
                  mode="outlined"
                  placeholder={t('admin.businessForm.enterPhone')}
                  style={styles.input}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  left={<TextInput.Icon icon="phone" color={colors.medium} />}
                  keyboardType="phone-pad"
                  textAlign={i18n.language === 'he' ? 'right' : 'left'}
                  theme={{ roundness: 8 }}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          <Divider />
          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={resetFormAndClose}
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonLabel}
              theme={{ roundness: 8 }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              mode="contained"
              onPress={handleAddBusiness}
              style={[
                styles.submitButton,
                !isFormValid && styles.disabledButton
              ]}
              loading={isPending}
              disabled={!isFormValid || isPending}
              theme={{ roundness: 8 }}
            >
              {isPending ? t('admin.businessForm.creating') : t('admin.businessForm.createBusiness')}
            </Button>
          </View>
        </Surface>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 500 : '92%',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: height * 0.85,
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.dark,
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    margin: 0,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    ...typography.body2,
    color: colors.medium,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.white,
    fontSize: 16,
    height: 48,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    gap: 12,
    backgroundColor: colors.white,
  },
  cancelButton: {
    borderColor: colors.border,
    borderWidth: 1.5,
    minWidth: 100,
  },
  cancelButtonLabel: {
    color: colors.dark,
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.primary,
    minWidth: 120,
  },
  disabledButton: {
    backgroundColor: colors.medium,
    opacity: 0.7,
  },
});
