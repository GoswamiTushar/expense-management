import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './apiClient';

const STORAGE_KEY = '@airbnb_notifications';

export const getVapidPublicKey = async () => {
  try {
    const res = await apiClient('/notifications/vapid-public-key');
    return res?.publicKey || null;
  } catch (err) {
    console.warn('[Push] Failed to fetch VAPID key:', err.message);
    return null;
  }
};

export const getNotificationsByProperty = async (propertyId, since = null) => {
  if (!propertyId) return [];
  try {
    const query = since
      ? `/notifications?propertyId=${propertyId}&since=${encodeURIComponent(since)}`
      : `/notifications?propertyId=${propertyId}`;
    const list = await apiClient(query);
    if (!since && Array.isArray(list)) {
      await AsyncStorage.setItem(`${STORAGE_KEY}_${propertyId}`, JSON.stringify(list));
    }
    return Array.isArray(list) ? list : [];
  } catch (_) {
    if (!since) {
      const cached = await AsyncStorage.getItem(`${STORAGE_KEY}_${propertyId}`);
      return cached ? JSON.parse(cached) : [];
    }
    return [];
  }
};

export const getUnreadNotificationCount = async (propertyId) => {
  if (!propertyId) return 0;
  try {
    const res = await apiClient(`/notifications/unread-count?propertyId=${propertyId}`);
    return res?.unreadCount || 0;
  } catch (_) {
    return 0;
  }
};

export const markNotificationsRead = async (propertyId) => {
  if (!propertyId) return { success: false };
  try {
    return await apiClient(`/notifications/read?propertyId=${propertyId}`, {
      method: 'POST',
    });
  } catch (err) {
    console.warn('Failed to mark notifications read:', err.message);
    return { success: false };
  }
};
