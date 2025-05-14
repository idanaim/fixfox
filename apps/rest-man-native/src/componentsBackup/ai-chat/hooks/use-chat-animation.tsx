import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export const useChatAnimation = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  return fadeAnim;
};

