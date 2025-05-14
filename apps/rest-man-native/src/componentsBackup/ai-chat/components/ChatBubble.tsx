import React from 'react';
import { Animated } from 'react-native';

export const ChatBubble = ({ message, index }) => {
  const isBot = message.sender === 'system';

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100)}
      style={[
        styles.bubble,
        isBot ? styles.botBubble : styles.userBubble
      ]}
    >
      {message.type === 'equipment' ? (
        <EquipmentCard {...message.data} />
      ) : message.type === 'solution' ? (
        <SolutionCard {...message.data} />
      ) : (
        <Text style={isBot ? styles.botText : styles.userText}>
          {message.text}
        </Text>
      )}
    </Animated.View>
  );
};
