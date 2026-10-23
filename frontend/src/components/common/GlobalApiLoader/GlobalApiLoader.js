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

  // Listen to global API requests
  useEffect(() => {
    return apiTracker.subscribe((newState) => {
      setState(newState);
    });
  }, []);

  // Pulsing glow animation for the circular loader icon
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
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
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
    <Modal
      visible={state.isSlow}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => { }} // Block back-button / dismiss while connecting
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

          {state.isTimedOut ? (
            <TouchableOpacity
              onPress={handleRetry}
              style={styles.retryBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={15} color="#0f172a" />
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={13} color="#38BDF8" />
              <Text style={styles.badgeText}>Connecting & Fetching Details</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
