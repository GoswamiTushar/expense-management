import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './apiClient';

const STORAGE_KEY = '@airbnb_properties_live';

export const getProperties = async () => {
  try {
    const list = await apiClient('/properties');
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return list;
  } catch (_) {
    const cached = await AsyncStorage.getItem(STORAGE_KEY);
    return cached ? JSON.parse(cached) : [];
  }
};

export const createProperty = async (property) => {
  const newProp = await apiClient('/properties', {
    method: 'POST',
    body: {
      name: property.name,
      location: property.location,
      managers: property.managers || [],
      otaLinks: property.otaLinks || {},
    },
  });
  const cached = await AsyncStorage.getItem(STORAGE_KEY);
  const list = cached ? JSON.parse(cached) : [];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([newProp, ...list]));
  return newProp;
};

export const addManagerToProperty = async (propertyId, userId) => {
  return await apiClient(`/properties/${propertyId}/managers`, {
    method: 'POST',
    body: { userId },
  });
};
