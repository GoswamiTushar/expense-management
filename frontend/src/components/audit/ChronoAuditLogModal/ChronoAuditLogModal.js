import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createChronoAuditStyles } from './ChronoAuditLogModal.styles';
import { useTheme } from '../../../context/ThemeContext';
import { formatCurrency } from '../../../utils/currency';
import { formatDateTime } from '../../../utils/date';
import { useSwipeDown } from '../../../hooks/useSwipeDown';

export default function ChronoAuditLogModal({
  visible,
  onClose,
  expenses = [],
  onLoadMore,
  loadingMore,
}) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createChronoAuditStyles(colors, isDark), [colors, isDark]);

  const slideAnim = useRef(new Animated.Value(600)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      onClose();
    });
  };

  const swipeHandlers = useSwipeDown(slideAnim, handleClose, false);

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(600);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 26,
          mass: 0.9,
          stiffness: 220,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const sorted = [...expenses].sort(
    (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
  );

  return (
    <Modal visible={true} transparent onRequestClose={handleClose}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Drag Handle */}
          <View {...swipeHandlers} style={styles.dragHandle} />

          <View {...swipeHandlers} style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <Ionicons name="time" size={18} color={colors.primary} />
              <Text style={styles.title}>Chronological Expense Log</Text>
            </View>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.sub}>
            Exact chronological timeline of who logged which expense and audit details.
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              // Infinite scroll: auto load next batch seamlessly near end
              if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 120) {
                if (onLoadMore) {
                  onLoadMore();
                }
              }
            }}
            scrollEventThrottle={32}
          >
            {sorted.length === 0 ? (
              <Text style={{ color: colors.textMuted, textAlign: 'center', paddingVertical: 24 }}>
                No expense logs yet.
              </Text>
            ) : (
              sorted.map((exp) => (
                <View key={exp._id || exp.id} style={styles.item}>
                  <View style={styles.itemTop}>
                    <Text style={styles.actor}>{exp.payerName || exp.paidBy}</Text>
                    <Text style={styles.amount}>{formatCurrency(exp.amount)}</Text>
                  </View>
                  <Text style={styles.desc}>
                    "{exp.title}" • {exp.category}
                    {exp.notes ? ` • Note: ${exp.notes}` : ''}
                  </Text>
                  <Text style={styles.time}>{formatDateTime(exp.createdAt || exp.date)}</Text>
                </View>
              ))
            )}

            {loadingMore && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 14,
                }}
              >
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textMuted }}>
                  Loading more expense logs...
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
