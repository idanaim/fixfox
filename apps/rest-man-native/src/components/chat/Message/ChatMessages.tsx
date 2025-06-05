// components/ChatMessages.tsx
import React, { useRef, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ChatMessage } from '../../../api/chatAPI';
import { MessageItem } from './ChatMessageItem';
import { colors } from '../../admin-dashboard/admin-dashboard-styles';

interface ChatMessagesProps {
  messages: ChatMessage[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {messages.map((message) => (
        <MessageItem key={message.id} {...message} />
      ))}
    </ScrollView>
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
  }
});

export default ChatMessages;
