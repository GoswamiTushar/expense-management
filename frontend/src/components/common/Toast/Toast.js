import React, { useState, useEffect } from 'react';
import { View, Text, Animated, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './Toast.styles';
import { colors } from '../../../theme/colors';
import { toastEmitter } from '../../../services/notifications/toastEmitter';

export default function Toast() {
  const [toast, setToast] = useState(null);
  const [slideAnim] = useState(new Animated.Value(-100));
  const insets = useSafeAreaInsets();

  useEffect(() => {
    return toastEmitter.subscribe((data) => {
      setToast(data);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
      const timer = setTimeout(() => {
        Animated.timing(slideAnim, { toValue: -120, duration: 250, useNativeDriver: true }).start(() => setToast(null));
      }, 5000);
      return () => clearTimeout(timer);
    });
  }, []);

  if (!toast) return null;

  // Render below the status bar / notch on all devices
  const topOffset = (insets.top || 0) + (Platform.OS === 'web' ? 12 : 8);

  return (
    <Animated.View style={[styles.container, { top: topOffset, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.card}>
        <View style={styles.iconBox}>
          <Ionicons
            name={toast.type === 'expense' ? 'receipt' : 'checkmark-done-circle'}
            size={20}
            color={colors.white}
          />
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{toast.title}</Text>
          <Text style={styles.message} numberOfLines={2}>{toast.message}</Text>
        </View>
        <TouchableOpacity onPress={() => setToast(null)}>
          <Ionicons name="close" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
