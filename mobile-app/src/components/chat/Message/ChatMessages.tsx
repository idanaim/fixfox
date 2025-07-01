// components/ChatMessages.tsx
import React, { useRef, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { ChatMessage } from '../../../api/chatAPI';
import { MessageItem } from './ChatMessageItem';
import { colors } from '../../admin-dashboard/admin-dashboard-styles';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native';

interface ChatMessagesProps {
  messages: ChatMessage[];
  renderMessageActions?: (message: ChatMessage) => React.ReactNode;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages,
  renderMessageActions 
}) => {
  const flatListRef = useRef<FlatList>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderMessage = ({ item: message }: { item: ChatMessage }) => (
    <View style={styles.messageContainer}>
      <View
        style={[
          styles.messageBubble,
          message.sender === 'user'
            ? styles.userMessage
            : styles.systemMessage,
        ]}
      >
        <Text style={styles.messageText}>{message.content}</Text>
      </View>
      {renderMessageActions && renderMessageActions(message)}
    </View>
  );

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item, index) => `${item.id || index}`}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
  },
  systemMessage: {
    backgroundColor: colors.lightGray,
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: colors.dark,
  },
});

export default ChatMessages;
