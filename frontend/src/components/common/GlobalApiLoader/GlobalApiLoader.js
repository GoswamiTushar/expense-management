import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  Animated,
  ActivityIndicator,
  TouchableOpacity,
  Easing,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiTracker } from '../../../services/api/apiTracker';
import { styles } from './GlobalApiLoader.styles';

export default function GlobalApiLoader() {
  const [state, setState] = useState({ isLoading: false, isSlow: false, isTimedOut: false, activeCount: 0 });
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

  const handleRetry = () => {
    apiTracker.forceReset();
    if (Platform.OS === 'web') {
      window.location.reload();
    } else {
      // On native, just reset — the user can pull-to-refresh
      // The fetch itself will have already errored out due to timeout
    }
  };

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
              {state.isTimedOut
                ? <Ionicons name="cloud-offline-outline" size={22} color="#F87171" />
                : <ActivityIndicator size="small" color="#38BDF8" />
              }
            </Animated.View>

            <Text style={styles.overlayTitle}>
              {state.isTimedOut ? 'Server Unavailable' : 'Synchronizing with Cloud Server...'}
            </Text>
            <Text style={styles.overlaySub}>
              {state.isTimedOut
                ? 'The server is taking too long to respond. It may be waking up from sleep. Try again in a moment.'
                : 'Establishing secure connection with property database. Please wait a moment...'}
            </Text>

            {/* Glowing progress line — hidden when timed out */}
            {!state.isTimedOut && (
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
            )}

            {state.isTimedOut ? (
              <TouchableOpacity
                onPress={handleRetry}
                style={{
                  marginTop: 16,
                  backgroundColor: '#38BDF8',
                  paddingHorizontal: 24,
                  paddingVertical: 10,
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={15} color="#0f172a" />
                <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 13 }}>Retry</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.badge}>
                <Ionicons name="shield-checkmark" size={13} color="#38BDF8" />
                <Text style={styles.badgeText}>Encrypted Cloud Sync</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}
