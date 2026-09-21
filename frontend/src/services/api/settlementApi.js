import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './apiClient';

const STORAGE_KEY = '@airbnb_settlements_v2';

export const getSettlementsByProperty = async (propertyId) => {
  try {
    const q = propertyId ? `?propertyId=${propertyId}` : '';
    const list = await apiClient(`/settlements${q}`);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return list;
  } catch (_) {
    const cached = await AsyncStorage.getItem(STORAGE_KEY);
    const list = cached ? JSON.parse(cached) : [];
    return propertyId ? list.filter((s) => s.propertyId === propertyId) : list;
  }
};

export const createSettlement = async (settlement) => {
  const newRecord = await apiClient('/settlements', {
    method: 'POST',
    body: settlement,
  });
  const cached = await AsyncStorage.getItem(STORAGE_KEY);
  const list = cached ? JSON.parse(cached) : [];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([newRecord, ...list]));
  return newRecord;
};
