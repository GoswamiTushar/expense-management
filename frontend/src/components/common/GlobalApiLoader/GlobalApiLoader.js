import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  Animated,
  ActivityIndicator,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiTracker } from '../../../services/api/apiTracker';
import { styles } from './GlobalApiLoader.styles';

export default function GlobalApiLoader() {
  const [state, setState] = useState({ isLoading: false, isSlow: false, activeCount: 0 });
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Listen to global API requests
  useEffect(() => {
    return apiTracker.subscribe((newState) => {
      setState(newState);
    });
  }, []);

  // Top progress bar looping sweep animation when loading
  useEffect(() => {
    let animLoop = null;
    if (state.isLoading) {
      progressAnim.setValue(0);
      animLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(progressAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: false,
          }),
          Animated.timing(progressAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      );
      animLoop.start();
    } else {
      progressAnim.stopAnimation();
      progressAnim.setValue(0);
    }

    return () => {
      if (animLoop) animLoop.stop();
    };
  }, [state.isLoading]);

  // Pulsing glow animation for the modal icon
  useEffect(() => {
    let pulseLoop = null;
    if (state.isSlow) {
      pulseAnim.setValue(1);
      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }

    return () => {
      if (pulseLoop) pulseLoop.stop();
    };
  }, [state.isSlow]);

  const leftInterpolate = progressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0%', '25%', '100%'],
  });

  const widthInterpolate = progressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0%', '60%', '0%'],
  });

  return (
    <>
      {/* Sleek top progress line for all active requests */}
      {state.isLoading && !state.isSlow && (
        <View style={styles.topBarContainer}>
          <Animated.View
            style={[
              styles.topBarIndicator,
              {
                marginLeft: leftInterpolate,
                width: widthInterpolate,
              },
            ]}
          />
        </View>
      )}

      {/* Top-layer blocking modal alert during pending/slow cold-start */}
      <Modal
        visible={state.isSlow}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {}} // Block back-button / dismiss while connecting
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.overlayCard}>
            <Animated.View style={[styles.pulseGlowBox, { transform: [{ scale: pulseAnim }] }]}>
              <ActivityIndicator size="small" color="#38BDF8" />
            </Animated.View>

            <Text style={styles.overlayTitle}>Synchronizing with Cloud Server...</Text>
            <Text style={styles.overlaySub}>
              Establishing secure connection with property database. Please wait a moment...
            </Text>

            {/* Glowing progress line */}
            <View style={styles.progressBarTrack}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    marginLeft: leftInterpolate,
                    width: widthInterpolate,
                  },
                ]}
              />
            </View>

            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={13} color="#38BDF8" />
              <Text style={styles.badgeText}>Encrypted Cloud Sync</Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
