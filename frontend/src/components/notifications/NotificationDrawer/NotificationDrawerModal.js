import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createNotificationStyles, styles as defaultStyles } from './NotificationDrawerModal.styles';
import { useTheme } from '../../../context/ThemeContext';
import { formatDateTime } from '../../../utils/date';
import { requestBrowserNotificationPermission } from '../../../services/notifications/pushService';

export default function NotificationDrawerModal({
  visible,
  onClose,
  notifications = [],
  onMarkAllRead,
  currentUser,
}) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createNotificationStyles(colors, isDark), [colors, isDark]);
  const [browserPerm, setBrowserPerm] = useState('granted');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.92);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 120,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = (callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.94,
        duration: 180,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      onClose();
      if (typeof callback === 'function') callback();
    });
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPerm(Notification.permission);
    }
  }, [visible]);

  if (!visible) return null;

  const currentUserId = String(currentUser?._id || currentUser?.id || '');

  const unreadList = notifications.filter(
    (n) => !(n.readBy || []).includes(currentUserId)
  );

  const handleEnableNotifications = async () => {
    const granted = await requestBrowserNotificationPermission();
    setBrowserPerm(granted ? 'granted' : 'denied');
  };

  const getNotifMeta = (type) => {
    switch (type) {
      case 'expense_created':
        return { icon: 'wallet-outline', color: '#5E5CE6', bg: 'rgba(94, 92, 230, 0.15)' };
      case 'expense_updated':
        return { icon: 'create-outline', color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.15)' };
      case 'settlement':
        return { icon: 'checkmark-circle-outline', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
      default:
        return { icon: 'notifications-outline', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)' };
    }
  };

  return (
    <Modal visible={true} transparent onRequestClose={() => handleClose()}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableWithoutFeedback onPress={() => handleClose()}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        </TouchableWithoutFeedback>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleGroup}>
              <Ionicons name="notifications" size={18} color={colors.primary} />
              <Text style={styles.title}>Activity &amp; Alerts</Text>
              {unreadList.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadList.length}</Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {unreadList.length > 0 && onMarkAllRead && (
                <TouchableOpacity
                  style={styles.markReadBtn}
                  onPress={onMarkAllRead}
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkmark-done" size={13} color="#38BDF8" />
                  <Text style={styles.markReadText}>Mark read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => handleClose()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Browser System Notification Permission Callout (if default) */}
          {Platform.OS === 'web' && browserPerm === 'default' && (
            <View style={styles.browserPermCard}>
              <View style={styles.browserPermLeft}>
                <Ionicons name="notifications-outline" size={15} color={colors.info} />
                <Text style={styles.browserPermText}>
                  Enable browser push notifications for real-time spend alerts.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.enableBtn}
                onPress={handleEnableNotifications}
                activeOpacity={0.8}
              >
                <Text style={styles.enableBtnText}>Enable</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Notifications List */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="notifications-off-outline" size={38} color={colors.textDim} />
                <Text style={styles.emptyTitle}>No Notifications Yet</Text>
                <Text style={styles.emptySub}>
                  Activity from co-managers when expenses are logged, updated, or settled will appear here in real time.
                </Text>
              </View>
            ) : (
              notifications.map((n, i) => {
                const isUnread = !(n.readBy || []).includes(currentUserId);
                const meta = getNotifMeta(n.type);

                return (
                  <View
                    key={n.id || n._id || i}
                    style={[styles.item, isUnread && styles.itemUnread]}
                  >
                    <View style={[styles.iconBox, { backgroundColor: meta.bg }]}>
                      <Ionicons name={meta.icon} size={17} color={meta.color} />
                    </View>
                    <View style={styles.itemContent}>
                      <View style={styles.itemTop}>
                        <Text style={styles.itemTitle}>{n.title}</Text>
                        <Text style={styles.itemTime}>
                          {formatDateTime(n.createdAt)}
                        </Text>
                      </View>
                      <Text style={styles.itemBody}>{n.body}</Text>
                    </View>
                    {isUnread && <View style={styles.unreadDot} />}
                  </View>
                );
              })
            )}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
