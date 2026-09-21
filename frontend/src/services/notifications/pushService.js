import { CONFIG } from '../../config/urls';
import { toastEmitter } from './toastEmitter';
import { formatCurrency } from '../../utils/currency';

export const sendExpensePushNotification = async ({
  property,
  payerName,
  title,
  amount,
  shareAmount,
  recipients = [],
}) => {
  const notifTitle = `Airbnb Expense: ${property.name}`;
  const notifBody = `${payerName} added ${formatCurrency(amount)} for "${title}". Your share to pay is ${formatCurrency(shareAmount)}.`;

  // 1. Fire in-app toast
  toastEmitter.emit(notifTitle, notifBody, 'expense');

  // 2. Dispatch to Expo Push API
  const messages = recipients
    .filter((u) => u.expoPushToken)
    .map((u) => ({
      to: u.expoPushToken,
      title: notifTitle,
      body: notifBody,
      data: { propertyId: property._id, title, amount },
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

export const sendSettlementPushNotification = async ({ property, debtorName, creditorName, amount }) => {
  const title = `Settlement Completed: ${property.name}`;
  const body = `${debtorName} settled ${formatCurrency(amount)} with ${creditorName}. Balance reset to ₹0.`;
  toastEmitter.emit(title, body, 'settlement');
};
