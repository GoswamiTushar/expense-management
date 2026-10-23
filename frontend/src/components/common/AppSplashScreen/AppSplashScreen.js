import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Animated, ActivityIndicator, Easing, Platform } from 'react-native';
import { styles } from './AppSplashScreen.styles';

export default function AppSplashScreen({ isReady, onAnimationComplete }) {
  const [visible, setVisible] = useState(true);

  // Entrance & breathing animation values
  const enterOpacity = useRef(new Animated.Value(0)).current;
  const enterScale = useRef(new Animated.Value(0.9)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  // Exit animation values
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  // 1. Entrance reveal + continuous breathing pulse
  useEffect(() => {
    // Reveal logo and text
    Animated.parallel([
      Animated.timing(enterOpacity, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(enterScale, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    // Subtle gentle pulse
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.04,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, []);

  // 2. Cinematic exit transition once app data is ready
  useEffect(() => {
    if (!isReady) return;

    // Small delay for smooth perception before fade-out
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(exitOpacity, {
          toValue: 0,
          duration: 320,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(exitScale, {
          toValue: 1.06,
          duration: 320,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start(() => {
        setVisible(false);
        if (onAnimationComplete) onAnimationComplete();
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [isReady]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: exitOpacity,
          transform: [{ scale: exitScale }],
        },
      ]}
      pointerEvents={isReady ? 'none' : 'auto'}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: enterOpacity,
            transform: [{ scale: enterScale }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.logoContainer,
            { transform: [{ scale: pulseScale }] },
          ]}
        >
          <Image
            source={require('../../../../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        <Text style={styles.title}>Ledger</Text>
        <Text style={styles.subtitle}>SPLIT • TRACK • SETTLE</Text>

        <View style={styles.loaderRow}>
          <ActivityIndicator size="small" color="#6366F1" />
          <Text style={styles.loaderText}>Loading workspace...</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}
