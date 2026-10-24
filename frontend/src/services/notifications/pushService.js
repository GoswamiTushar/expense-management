import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { CONFIG } from '../../config/urls';
import { toastEmitter } from './toastEmitter';
import { formatCurrency } from '../../utils/currency';
import { apiClient } from '../api/apiClient';
import { getVapidPublicKey } from '../api/notificationApi';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const registerWebPushSubscription = async () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const vapidKey = await getVapidPublicKey();
    if (!vapidKey) return null;

    const reg = await navigator.serviceWorker.ready;
    if (!reg || !reg.pushManager) return null;

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
    }

    if (sub) {
      const subJson = sub.toJSON();
      await apiClient('/auth/push-token', {
        method: 'PATCH',
        body: { subscription: subJson, platform: 'web' },
      });
      console.log('[WebPush] Successfully registered Web Push subscription with backend.');
      return subJson;
    }
  } catch (err) {
    console.warn('[WebPush] Subscription notice:', err.message);
  }
  return null;
};

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
  // Web: register Service Worker Web Push subscription
  if (Platform.OS === 'web') {
    const perm = await requestBrowserNotificationPermission();
    if (perm) {
      await registerWebPushSubscription();
    }
    return perm;
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

import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIF_DENIED_STORAGE_KEY = '@ledger_notif_prompt_denied';

// ─── Check current notification permission status ─────────────────────────────
export const checkNotificationPermissionStatus = async () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') return 'granted';
      if (Notification.permission === 'denied') return 'denied';
      return 'off'; // 'default'
    }
    return 'unsupported';
  }

  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') return 'granted';
    if (status === 'denied') return 'denied';
    return 'off';
  } catch (_) {
    return 'off';
  }
};

// ─── Check if user previously denied/dismissed in-app prompt ──────────────────
export const isNotificationPromptDenied = async () => {
  try {
    const val = await AsyncStorage.getItem(NOTIF_DENIED_STORAGE_KEY);
    return val === 'true';
  } catch (_) {
    return false;
  }
};

export const setNotificationPromptDenied = async () => {
  try {
    await AsyncStorage.setItem(NOTIF_DENIED_STORAGE_KEY, 'true');
  } catch (_) {}
};

export const clearNotificationPromptDenied = async () => {
  try {
    await AsyncStorage.removeItem(NOTIF_DENIED_STORAGE_KEY);
  } catch (_) {}
};

// ─── Request notification permission on user gesture (Button Tap) ──────────────
export const requestNotificationPermissionWithPrompt = async () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        if (res === 'granted') {
          await clearNotificationPromptDenied();
          // Register Web Push Service Worker subscription so alerts arrive when app is closed
          await registerWebPushSubscription();
          // Trigger instant welcome notification so user sees it working immediately
          await triggerBrowserNotification(
            'Notifications Enabled! ✓',
            'You will now receive phone and lockscreen alerts even when the app is closed.'
          );
          return 'granted';
        } else if (res === 'denied') {
          await setNotificationPromptDenied();
          return 'denied';
        }
        return 'off';
      } catch (err) {
        console.warn('[Push] Permission request notice:', err);
        return 'denied';
      }
    }
    return 'unsupported';
  }

  // Native iOS / Android
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus === 'granted') {
      await clearNotificationPromptDenied();
      await registerForPushNotifications();
      await triggerSystemNotification(
        'Notifications Enabled! ✓',
        'You will now receive instant phone alerts for settlements and group expenses.'
      );
      return 'granted';
    } else {
      await setNotificationPromptDenied();
      return 'denied';
    }
  } catch (err) {
    console.warn('[Push] Native permission notice:', err);
    return 'denied';
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

export const sendSettlementRequestPushNotification = async ({
  property,
  payerName,
  creditorName,
  amount,
  code = '',
  recipients = [],
}) => {
  const codeStr = code ? ` (Code: ${code})` : '';
  const notifTitle = `Payment Verification Needed 🔔`;
  const notifBody = `${payerName || 'Member'} recorded ${formatCurrency(amount)} via UPI${codeStr}. Tap to confirm receipt.`;

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
      data: { propertyId: property?._id || property?.id, amount, code },
    }))
  );
  await sendToExpoPush(messages);
};

export const sendSettlementPushNotification = async ({
  property,
  debtorName,
  creditorName,
  amount,
  approverName = '',
  recipients = [],
}) => {
  const notifTitle = `Settlement Approved! ✓`;
  const notifBody = `${formatCurrency(amount)} has been settled with ${approverName || creditorName || 'approval'}.`;

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

