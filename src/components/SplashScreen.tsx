import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  runOnJS
} from 'react-native-reanimated';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const translateY = useSharedValue(50);
  const iconRotation = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    // Complex animation sequence
    const startAnimation = () => {
      // Initial fade in and scale
      opacity.value = withTiming(1, { duration: 600 });
      scale.value = withSpring(1, { damping: 8, stiffness: 100 });
      translateY.value = withSpring(0, { damping: 8, stiffness: 100 });
      
      // Icon rotation
      iconRotation.value = withSequence(
        withTiming(360, { duration: 1000 }),
        withTiming(720, { duration: 500 })
      );
      
      // Progress bar animation
      setTimeout(() => {
        progressWidth.value = withTiming(100, { duration: 1200 });
      }, 800);
      
      // Final fade out
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 600 }, () => {
          runOnJS(onFinish)();
        });
        scale.value = withTiming(1.1, { duration: 600 });
      }, 2500);
    };
    
    startAnimation();
  }, []);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value }
    ],
  }));
  
  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotation.value}deg` }],
  }));
  
  const animatedProgressStyle = useAnimatedStyle(() => {
    const width = interpolate(progressWidth.value, [0, 100], [0, 200]);
    return {
      width,
    };
  });

  return (
    <LinearGradient
      colors={['#f8fafc', '#e2e8f0', '#cbd5e1']}
      className="flex-1 items-center justify-center"
    >
      {/* Background Pattern */}
      <View className="absolute inset-0 opacity-5">
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={i}
            className="absolute bg-text-primary rounded-full"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: Math.random() * width,
              top: Math.random() * height,
            }}
          />
        ))}
      </View>
      
      <Animated.View style={animatedContainerStyle} className="items-center">
        {/* App Icon */}
        <Animated.View 
          style={animatedIconStyle}
          className="bg-accent w-20 h-20 rounded-2xl items-center justify-center mb-6 shadow-medium"
        >
          <Ionicons name="document-text" size={40} color="white" />
        </Animated.View>
        
        {/* App Name */}
        <Text className="text-5xl font-bold text-text-primary mb-3">
          Notistant
        </Text>
        
        {/* Tagline */}
        <Text className="text-xl text-text-secondary mb-8 text-center max-w-xs">
          Slimme notities & planning
        </Text>
        
        {/* Progress Bar */}
        <View className="w-50 h-1 bg-background-muted rounded-full overflow-hidden">
          <Animated.View 
            style={animatedProgressStyle}
            className="h-full bg-accent rounded-full"
          />
        </View>
        
        {/* Loading Text */}
        <Text className="text-sm text-text-muted mt-4 font-medium">
          Laden...
        </Text>
      </Animated.View>
      
      {/* Version Info */}
      <View className="absolute bottom-10 items-center">
        <Text className="text-xs text-text-muted">
          Versie 1.0.0 • Made with ❤️
        </Text>
      </View>
    </LinearGradient>
  );
}
