import { Platform, Vibration } from 'react-native';

/**
 * Universal Haptic Service for PWA & Native Apps.
 * - On Native (iOS/Android): uses expo-haptics (Taptic Engine / Android Vibrator).
 * - On PWA / Web: uses navigator.vibrate with micro-pulse vibration patterns.
 */

let expoHaptics = null;
const getExpoHaptics = () => {
  if (Platform.OS === 'web') return null;
  if (!expoHaptics) {
    try {
      expoHaptics = require('expo-haptics');
    } catch (_) {
      expoHaptics = null;
    }
  }
  return expoHaptics;
};

export const triggerHaptic = (type = 'light', enabled = true) => {
  if (!enabled) return;

  // 1. Web / PWA Vibration API (Mobile Chrome, Android PWA, mobile browsers)
  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        switch (type) {
          case 'selection':
            navigator.vibrate(8);
            break;
          case 'light':
            navigator.vibrate(14);
            break;
          case 'medium':
            navigator.vibrate(26);
            break;
          case 'heavy':
            navigator.vibrate(45);
            break;
          case 'success':
            navigator.vibrate([15, 40, 20]);
            break;
          case 'warning':
            navigator.vibrate([30, 50, 30]);
            break;
          case 'error':
            navigator.vibrate([40, 60, 40, 60, 40]);
            break;
          default:
            navigator.vibrate(14);
            break;
        }
      } catch (_) {}
    }
    return;
  }

  // 2. Native iOS / Android (Expo Haptics + Vibration fallback)
  const Haptics = getExpoHaptics();
  if (Haptics) {
    try {
      switch (type) {
        case 'selection':
          Haptics.selectionAsync().catch(() => Vibration.vibrate(8));
          break;
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => Vibration.vibrate(12));
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => Vibration.vibrate(25));
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => Vibration.vibrate(45));
          break;
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() =>
            Vibration.vibrate([15, 40, 20])
          );
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() =>
            Vibration.vibrate([30, 50, 30])
          );
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() =>
            Vibration.vibrate([40, 60, 40])
          );
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => Vibration.vibrate(12));
          break;
      }
      return;
    } catch (_) {}
  }

  // Fallback to React Native Vibration
  try {
    Vibration.vibrate(15);
  } catch (_) {}
};
