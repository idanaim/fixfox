import React, { useRef } from 'react';
import { TouchableOpacity, Animated } from 'react-native';

interface AnimatedButtonProps {
  onPress: () => void;
  children: React.ReactNode;
}

const AnimatedButton = ({ onPress, children }: AnimatedButtonProps) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const animatePress = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const animateRelease = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        onPressIn={animatePress}
        onPressOut={animateRelease}
        onPress={onPress}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AnimatedButton;
