import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  runOnJS
} from 'react-native-reanimated';
import '../../global.css';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Fade in, stay visible, then fade out
    opacity.value = withSequence(
      withTiming(1, { duration: 800 }),
      withTiming(1, { duration: 1000 }),
      withTiming(0, { duration: 800 }, () => {
        runOnJS(onFinish)();
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Animated.View style={animatedStyle} className="items-center">
        <Text className="text-4xl font-bold text-primary mb-2">Notistant</Text>
        <Text className="text-lg text-primary/70">Notities & Planning</Text>
      </Animated.View>
    </View>
  );
}
