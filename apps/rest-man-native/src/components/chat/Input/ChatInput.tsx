// components/ChatInput.tsx
import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography } from '../../../componentsBackup/admin-dashboard/admin-dashboard-styles';

interface ChatInputProps {
  inputValue: string;
  onChange: (value: string) => void;
  onSend: () => void;
  loading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ inputValue, onChange, onSend, loading }) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={onChange}
          placeholder="Type your message..."
          placeholderTextColor={colors.medium}
          multiline
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
