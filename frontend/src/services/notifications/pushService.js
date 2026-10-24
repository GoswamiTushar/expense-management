import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
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
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ||
      Constants?.easConfig?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    const token = tokenData.data;

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
 * Show a true OS-level system notification on Android/iOS mobile web, PWA & Desktop.
 * Utilizes ServiceWorkerRegistration.showNotification() for mobile Chrome/Android tray alerts.
 */
const triggerBrowserNotification = async (title, body) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;

  if (Notification.permission !== 'granted') {
    requestBrowserNotificationPermission();
    return false;
  }

  // 1. Service Worker showNotification (guaranteed OS notification tray on Android Chrome / PWA)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/favicon.png',
          vibrate: [200, 100, 200],
          tag: 'ledger-notification',
          renotify: true,
        });
        return true;
      }
    } catch (err) {
      console.warn('[Push] ServiceWorker notification notice:', err);
    }
  }

  // 2. Standard Web Notification constructor fallback
  try {
    new window.Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/favicon.png',
    });
    return true;
  } catch (err) {
    console.warn('[Push] Direct Notification constructor notice:', err);
    return false;
  }
};

/**
 * Schedule a local notification on the device (shows immediately for real-time feedback).
 */
export const triggerSystemNotification = async (title, body) => {
  if (Platform.OS === 'web') {
    return await triggerBrowserNotification(title, body);
  }

  // Native mobile: schedule immediate local OS notification
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null, // null = show immediately in OS notification tray
    });
    return true;
  } catch (err) {
    console.warn('[Push] Local notification error:', err);
    return false;
  }
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
  const notifTitle = `Ledger Expense: ${property?.name || 'Group'}`;
  const notifBody = `${payerName || 'Member'} added ${formatCurrency(amount)} for "${title}". Share: ${formatCurrency(shareAmount)}.`;

  // 1. Fire OS-level notification
  const osDelivered = await triggerSystemNotification(notifTitle, notifBody);

  // 2. If OS notifications aren't supported/permitted, fallback to in-app toast
  if (!osDelivered) {
    toastEmitter.emit(notifTitle, notifBody, 'expense');
  }

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
  const notifTitle = `Expense Edited: ${property?.name || 'Group'}`;
  const notifBody = `${editorName || 'Member'} updated ${summary || 'details'} for "${title}".`;

  const osDelivered = await triggerSystemNotification(notifTitle, notifBody);
  if (!osDelivered) {
    toastEmitter.emit(notifTitle, notifBody, 'edit');
  }

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
  const notifTitle = `Settlement Completed: ${property?.name || 'Group'}`;
  const notifBody = `${debtorName || 'Member'} settled ${formatCurrency(amount)} with ${creditorName || 'Member'}.`;

  const osDelivered = await triggerSystemNotification(notifTitle, notifBody);
  if (!osDelivered) {
    toastEmitter.emit(notifTitle, notifBody, 'settlement');
  }

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
