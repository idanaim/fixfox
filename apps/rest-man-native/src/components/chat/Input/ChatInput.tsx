// components/ChatInput.tsx
import React, { useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography } from '../../../componentsBackup/admin-dashboard/admin-dashboard-styles';
import { useLanguageDetection } from '../../../hooks/useLanguageDetection';

interface ChatInputProps {
  inputValue: string;
  onChange: (value: string) => void;
  onSend: () => void;
  loading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ inputValue, onChange, onSend, loading }) => {
  const { t } = useTranslation();
  // Use language detection hook to auto-switch language based on input
  const { isHebrew } = useLanguageDetection({
    text: inputValue,
    autoSwitch: true,
  });

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            { textAlign: isHebrew ? 'right' : 'left' }
          ]}
          value={inputValue}
          onChangeText={onChange}
          placeholder={t('chat.type_message')}
          placeholderTextColor={colors.medium}
          multiline
          textAlign={isHebrew ? 'right' : 'left'}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputValue.trim() && styles.sendButtonDisabled]}
          onPress={onSend}
          disabled={!inputValue.trim() || loading}
        >
          <Icon
            name="send"
            size={20}
            color={!inputValue.trim() || loading ? colors.medium : colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  input: {
    flex: 1,
    ...typography.body1,
    color: colors.dark,
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: colors.lightGray,
  },
});

export default ChatInput;
