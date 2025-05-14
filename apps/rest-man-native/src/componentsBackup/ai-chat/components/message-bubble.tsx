import React from 'react';
import { Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { FontAwesome } from '@expo/vector-icons';
import { styles } from '../styles/chat-styles';
import { Message } from '../interfaces/message';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => (
  <View
    style={[
      styles.messageContainer,
      message.isUser ? styles.userContainer : styles.aiContainer,
    ]}
  >
    <View style={styles.avatar}>
      <FontAwesome
        name={!message.isUser ? 'android' : 'user'}
        size={20}
        color="#FFF"
      />
    </View>
    <View
      style={[
        styles.messageBubble,
        message.isUser ? styles.userBubble : styles.aiBubble,
      ]}
    >
      <Markdown
        style={{
          body: { color: message.isUser ? '#1A1A1A' : '#333' },
          link: { color: '#6C63FF' },
          paragraph: { marginBottom: 0 },
        }}
      >
        {message.content}
      </Markdown>
      {message.isUser && (
        <Text style={styles.timestamp}>
          {new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      )}
    </View>
  </View>
);

export default MessageBubble;
