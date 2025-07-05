import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { colors, typography } from '../admin-dashboard/admin-dashboard-styles';

interface TypingIndicatorProps {
  message?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ message = "Typing..." }) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDots = () => {
      const animationSequence = Animated.sequence([
        Animated.timing(dot1, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot2, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot3, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot1, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot2, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot3, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);

      Animated.loop(animationSequence).start();
    };

    animateDots();
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>{message}</Text>
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot1,
                transform: [
                  {
                    scale: dot1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot2,
                transform: [
                  {
                    scale: dot2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot3,
                transform: [
                  {
                    scale: dot3.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  messageContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    borderTopLeftRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: '80%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageText: {
    ...typography.body1,
    color: colors.dark,
    marginRight: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginHorizontal: 2,
  },
});

export default TypingIndicator; 