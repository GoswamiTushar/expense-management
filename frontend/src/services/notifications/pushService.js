import { CONFIG } from '../../config/urls';
import { toastEmitter } from './toastEmitter';
import { formatCurrency } from '../../utils/currency';

/**
 * Request browser push notification permission (Web / PWA / Desktop)
 */
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
 * Dispatch system desktop / lock-screen notification if on Web / Browser
 */
export const triggerSystemNotification = (title, body) => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new window.Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch (err) {
        console.warn('System notification error:', err);
      }
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          try {
            new window.Notification(title, { body, icon: '/favicon.ico' });
          } catch (_) {}
        }
      });
    }
  }
};

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

  // 1. Fire in-app toast
  toastEmitter.emit(notifTitle, notifBody, 'expense');

  // 2. Fire browser desktop / mobile notification
  triggerSystemNotification(notifTitle, notifBody);

  // 3. Dispatch to Expo Push API for mobile apps
  const messages = recipients
    .filter((u) => u.expoPushToken)
    .map((u) => ({
      to: u.expoPushToken,
      title: notifTitle,
      body: notifBody,
      data: { propertyId: property?._id || property?.id, title, amount },
    }));

  if (messages.length > 0) {
    try {
      await fetch(CONFIG.EXPO_PUSH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messages),
      });
    } catch (err) {
      console.warn('Push dispatch notice:', err.message);
    }
  }
};

export const sendExpenseEditNotification = async ({
  property,
  editorName,
  title,
  summary,
}) => {
  const notifTitle = `Expense Edited: ${property?.name || 'Property'}`;
  const notifBody = `${editorName || 'Manager'} updated ${summary || 'details'} for "${title}".`;

  toastEmitter.emit(notifTitle, notifBody, 'edit');
  triggerSystemNotification(notifTitle, notifBody);
};

export const sendSettlementPushNotification = async ({
  property,
  debtorName,
  creditorName,
  amount,
}) => {
  const notifTitle = `Settlement Completed: ${property?.name || 'Property'}`;
  const notifBody = `${debtorName || 'Manager'} settled ${formatCurrency(amount)} with ${creditorName || 'Manager'}.`;

  toastEmitter.emit(notifTitle, notifBody, 'settlement');
  triggerSystemNotification(notifTitle, notifBody);
};
