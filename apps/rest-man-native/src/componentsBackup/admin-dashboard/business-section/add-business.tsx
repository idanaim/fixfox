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
    if (!name || !type) return;

    createBusiness(
      {
        name,
        type,
        address,
        mobile,
        adminId: user?.accountId,
      },
      {
        onSuccess: () => {
          resetFormAndClose();
        },
      }
    );
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
      transparent
      animationType="slide"
      onRequestClose={resetFormAndClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={modalStyles.container}
      >
        <SafeAreaView style={modalStyles.safeAreaContainer}>
          <Surface style={modalStyles.contentContainer}>
            {/* Header */}
            <View style={modalStyles.header}>
              <Text style={modalStyles.headerTitle}>{t('admin.businessForm.addNewBusiness')}</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={resetFormAndClose}
              />
            </View>

            <Divider />

            {/* Form */}
            <ScrollView
              style={modalStyles.scrollContainer}
              contentContainerStyle={modalStyles.formContainer}
              keyboardShouldPersistTaps="handled"
            >
              <View style={modalStyles.inputGroup}>
                <Text style={modalStyles.inputLabel}>{t('admin.businessForm.businessName')} *</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  mode="outlined"
                  placeholder={t('admin.businessForm.enterBusinessName')}
                  style={modalStyles.input}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  left={<TextInput.Icon icon="domain" color={colors.medium} />}
                  textAlign={i18n.language === 'he' ? 'right' : 'left'}
                />
              </View>

              <View style={modalStyles.inputGroup}>
                <Text style={modalStyles.inputLabel}>{t('admin.businessForm.businessType')} *</Text>
                <TextInput
                  value={type}
                  onChangeText={setType}
                  mode="outlined"
                  placeholder={t('admin.businessForm.enterType')}
                  style={modalStyles.input}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  left={<TextInput.Icon icon="store" color={colors.medium} />}
                  textAlign={i18n.language === 'he' ? 'right' : 'left'}
                />
              </View>

              <View style={modalStyles.inputGroup}>
                <Text style={modalStyles.inputLabel}>{t('admin.businessForm.address')}</Text>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  mode="outlined"
                  placeholder={t('admin.businessForm.enterAddress')}
                  style={modalStyles.input}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  left={<TextInput.Icon icon="map-marker" color={colors.medium} />}
                  multiline
                  numberOfLines={2}
                  textAlign={i18n.language === 'he' ? 'right' : 'left'}
                />
              </View>

              <View style={modalStyles.inputGroup}>
                <Text style={modalStyles.inputLabel}>{t('admin.businessForm.phoneNumber')}</Text>
                <TextInput
                  value={mobile}
                  onChangeText={setMobile}
                  mode="outlined"
                  placeholder={t('admin.businessForm.enterPhone')}
                  style={modalStyles.input}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  left={<TextInput.Icon icon="phone" color={colors.medium} />}
                  keyboardType="phone-pad"
                  textAlign={i18n.language === 'he' ? 'right' : 'left'}
                />
              </View>
            </ScrollView>

            {/* Footer */}
            <Divider />
            <View style={modalStyles.footer}>
              <Button
                mode="outlined"
                onPress={resetFormAndClose}
                style={modalStyles.cancelButton}
                labelStyle={{ color: colors.dark }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                mode="contained"
                onPress={handleAddBusiness}
                style={[
                  modalStyles.submitButton,
                  !isFormValid && modalStyles.disabledButton
                ]}
                loading={isLoading}
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? t('admin.businessForm.creating') : t('admin.businessForm.createBusiness')}
              </Button>
            </View>
          </Surface>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeAreaContainer: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 500 : '92%',
  },
  contentContainer: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.dark,
  },
  scrollContainer: {
    maxHeight: height * 0.6,
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    ...typography.body2,
    color: colors.medium,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.white,
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    gap: 12,
  },
  cancelButton: {
    borderColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  disabledButton: {
    backgroundColor: colors.medium,
    opacity: 0.7,
  },
});
