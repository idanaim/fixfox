// components/ChatMessageItem.tsx
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { ChatMessage } from '../../../api/chatAPI';
import { colors, typography } from '../../../componentsBackup/admin-dashboard/admin-dashboard-styles';
import { isHebrew } from '../../../i18n';

export const MessageItem = (message: ChatMessage) => {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';
  const { i18n } = useTranslation();
  
  // Detect if the message contains Hebrew text
  const messageHasHebrew = isHebrew(message.content);
  const textAlign = messageHasHebrew ? 'right' : 'left';

  return (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.otherMessageContainer,
      ]}
    >
      {/* Message content */}
      <View
        style={[
          styles.messageContent,
          isUser ? styles.userMessageContent : styles.otherMessageContent,
          isSystem && styles.systemMessageContent,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.otherMessageText,
            isSystem && styles.systemMessageText,
            { textAlign }
          ]}
        >
          {message.content}
        </Text>
      </View>

      {/* Message metadata */}
      <View style={[
        styles.messageMetadata,
        isUser ? styles.userMessageMetadata : styles.otherMessageMetadata
      ]}>
        {isUser && (
          <Icon
            name="account-circle"
            size={14}
            color={colors.medium}
            style={styles.userIcon}
          />
        )}
        {isSystem && (
          <Icon
            name="information"
            size={14}
            color={colors.medium}
            style={styles.systemIcon}
          />
        )}
        <Text style={styles.timestamp}>
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageContent: {
    padding: 12,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  userMessageContent: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 4,
  },
  otherMessageContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 4,
  },
  systemMessageContent: {
    backgroundColor: colors.lightGray,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  messageText: {
    ...typography.body1,
    lineHeight: 20,
  },
  userMessageText: {
    color: colors.white,
  },
  otherMessageText: {
    color: colors.dark,
  },
  systemMessageText: {
    color: colors.medium,
    fontStyle: 'italic',
  },
  messageMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 8,
  },
  userMessageMetadata: {
    justifyContent: 'flex-end',
  },
  otherMessageMetadata: {
    justifyContent: 'flex-start',
  },
  userIcon: {
    marginRight: 4,
  },
  systemIcon: {
    marginRight: 4,
  },
  timestamp: {
    ...typography.caption,
    color: colors.medium,
    opacity: 0.8,
  },
});

