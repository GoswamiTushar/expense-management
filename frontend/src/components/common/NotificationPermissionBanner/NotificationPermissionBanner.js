import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createNotificationBannerStyles } from './NotificationPermissionBanner.styles';
import { useTheme } from '../../../context/ThemeContext';
import { useFeedback } from '../../../context/FeedbackContext';
import {
  checkNotificationPermissionStatus,
  isNotificationPromptDenied,
  setNotificationPromptDenied,
  requestNotificationPermissionWithPrompt,
} from '../../../services/notifications/pushService';

export default function NotificationPermissionBanner() {
  const { colors, isDark } = useTheme();
  const { feedback } = useFeedback();
  const styles = useMemo(() => createNotificationBannerStyles(colors, isDark), [colors, isDark]);

  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const status = await checkNotificationPermissionStatus();
        const previouslyDenied = await isNotificationPromptDenied();

        // If notifications are off and user hasn't explicitly dismissed the in-app prompt
        if (status !== 'granted' && !previouslyDenied && mounted) {
          setVisible(true);
        }
      } catch (err) {
        console.log('[NotificationBanner] Check status notice:', err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleEnable = async () => {
    setRequesting(true);
    try {
      const result = await requestNotificationPermissionWithPrompt();
      if (result === 'granted') {
        feedback?.success?.();
        setVisible(false);
      } else {
        // User denied the OS/browser prompt: leave as it is
        setVisible(false);
      }
    } catch (_) {
      setVisible(false);
    } finally {
      setRequesting(false);
    }
  };

  const handleDismiss = async () => {
    feedback?.tap?.();
    await setNotificationPromptDenied();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <Ionicons name="notifications" size={18} color="#5E5CE6" />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Enable Mobile Notifications</Text>
          <Text style={styles.description}>
            Receive instant phone alerts for settlement requests, secret codes, and expense updates.
          </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.dismissBtn}
          onPress={handleDismiss}
          disabled={requesting}
          activeOpacity={0.7}
        >
          <Text style={styles.dismissText}>Not Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.enableBtn}
          onPress={handleEnable}
          disabled={requesting}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={14} color="#FFFFFF" />
          <Text style={styles.enableText}>
            {requesting ? 'Enabling...' : 'Enable Alerts'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
