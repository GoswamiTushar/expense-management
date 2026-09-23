import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './apiClient';

const STORAGE_KEY = '@airbnb_notifications';

export const getNotificationsByProperty = async (propertyId) => {
  if (!propertyId) return [];
  try {
    const list = await apiClient(`/notifications?propertyId=${propertyId}`);
    await AsyncStorage.setItem(`${STORAGE_KEY}_${propertyId}`, JSON.stringify(list));
    return list;
  } catch (_) {
    const cached = await AsyncStorage.getItem(`${STORAGE_KEY}_${propertyId}`);
    return cached ? JSON.parse(cached) : [];
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
