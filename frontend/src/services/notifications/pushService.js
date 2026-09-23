import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { CONFIG } from '../../config/urls';
import { toastEmitter } from './toastEmitter';
import { formatCurrency } from '../../utils/currency';
import { apiClient } from '../api/apiClient';

// ─── Notification display behaviour (how system shows the notification) ───────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ─── Register device & get Expo push token ────────────────────────────────────
export const registerForPushNotifications = async () => {
  // Web: use browser Notification API
  if (Platform.OS === 'web') {
    return requestBrowserNotificationPermission();
  }

  // Native: must be a real device (not simulator)
  if (!Device.isDevice) {
    console.log('[Push] Skipping: running on simulator/emulator');
    return null;
  }

  // Ask permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('[Push] Permission denied');
    return null;
  }

  // Android needs a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Airbnb Manager',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF385C',
    });
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '1b341bdf-3b39-4323-8d4b-8cc8d99ee036',
    });
    const token = tokenData.data;
    console.log('[Push] Expo token:', token);

    // Register token on backend so co-managers can push to this device
    try {
      await apiClient('/auth/push-token', {
        method: 'PATCH',
        body: { token, platform: Platform.OS },
      });
    } catch (err) {
      console.warn('[Push] Token registration failed:', err.message);
    }

    return token;
  } catch (err) {
    console.warn('[Push] Token fetch failed:', err.message);
    return null;
  }
};

// ─── Web: Browser Notification API ────────────────────────────────────────────
export const requestBrowserNotificationPermission = async () => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      if (Notification.permission === 'default') {
        const res = await Notification.requestPermission();
        return res === 'granted';
      }
      return Notification.permission === 'granted';
    } catch (_) {
      return false;
    }
  }
  return false;
};

/**
 * Show a system notification on web/PWA (browser Notification API)
 */
const triggerBrowserNotification = (title, body) => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new window.Notification(title, { body, icon: '/favicon.ico' });
      } catch (err) {
        console.warn('[Push] Browser notification error:', err);
      }
    }
  }
};

/**
 * Schedule a local notification on the device (shows immediately for real-time feedback).
 * Used when THIS device receives data via polling/websocket, not a push from server.
 */
export const triggerSystemNotification = (title, body) => {
  if (Platform.OS === 'web') {
    triggerBrowserNotification(title, body);
    return;
  }
  // Native: schedule immediate local notification
  Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: null, // null = show immediately
  }).catch((err) => console.warn('[Push] Local notification error:', err));
};

// ─── Dispatch push to co-managers via Expo Push API ──────────────────────────
const sendToExpoPush = async (messages) => {
  if (!messages || messages.length === 0) return;
  try {
    await fetch(CONFIG.EXPO_PUSH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });
  } catch (err) {
    console.warn('[Push] Expo push dispatch notice:', err.message);
  }
};

// ─── Notification helpers ─────────────────────────────────────────────────────

export const sendExpensePushNotification = async ({
  property,
  payerName,
  title,
  amount,
  shareAmount,
  recipients = [],
}) => {
  const notifTitle = `Airbnb Expense: ${property?.name || 'Property'}`;
  const notifBody = `${payerName || 'Manager'} added ${formatCurrency(amount)} for "${title}". Share: ${formatCurrency(shareAmount)}.`;

  // 1. Fire in-app toast (always)
  toastEmitter.emit(notifTitle, notifBody, 'expense');

  // 2. Fire browser/local system notification for the SENDER's own device
  triggerSystemNotification(notifTitle, notifBody);

  // 3. Send Expo push to all push tokens of co-managers (real device notifications)
  const messages = recipients.flatMap((u) =>
    (u.pushTokens || (u.expoPushToken ? [u.expoPushToken] : [])).map((token) => ({
      to: token,
      title: notifTitle,
      body: notifBody,
      sound: 'default',
      data: { propertyId: property?._id || property?.id, title, amount },
    }))
  );
  await sendToExpoPush(messages);
};

export const sendExpenseEditNotification = async ({
  property,
  editorName,
  title,
  summary,
  recipients = [],
}) => {
  const notifTitle = `Expense Edited: ${property?.name || 'Property'}`;
  const notifBody = `${editorName || 'Manager'} updated ${summary || 'details'} for "${title}".`;

  toastEmitter.emit(notifTitle, notifBody, 'edit');
  triggerSystemNotification(notifTitle, notifBody);

  const messages = recipients.flatMap((u) =>
    (u.pushTokens || (u.expoPushToken ? [u.expoPushToken] : [])).map((token) => ({
      to: token,
      title: notifTitle,
      body: notifBody,
      sound: 'default',
      data: { propertyId: property?._id || property?.id },
    }))
  );
  await sendToExpoPush(messages);
};

export const sendSettlementPushNotification = async ({
  property,
  debtorName,
  creditorName,
  amount,
  recipients = [],
}) => {
  const notifTitle = `Settlement Completed: ${property?.name || 'Property'}`;
  const notifBody = `${debtorName || 'Manager'} settled ${formatCurrency(amount)} with ${creditorName || 'Manager'}.`;

  toastEmitter.emit(notifTitle, notifBody, 'settlement');
  triggerSystemNotification(notifTitle, notifBody);

  const messages = recipients.flatMap((u) =>
    (u.pushTokens || (u.expoPushToken ? [u.expoPushToken] : [])).map((token) => ({
      to: token,
      title: notifTitle,
      body: notifBody,
      sound: 'default',
      data: { propertyId: property?._id || property?.id, amount },
    }))
  );
  await sendToExpoPush(messages);
};
