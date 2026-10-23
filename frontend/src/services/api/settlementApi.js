import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './apiClient';

const STORAGE_KEY = '@airbnb_settlements_v2';
const BALANCES_KEY = '@airbnb_balances_v2';

export const getSettlementsByProperty = async (propertyId, statusFilter = 'all') => {
  try {
    const params = [];
    if (propertyId) params.push(`propertyId=${encodeURIComponent(propertyId)}`);
    if (statusFilter && statusFilter !== 'all') params.push(`status_filter=${encodeURIComponent(statusFilter)}`);
    const q = params.length ? `?${params.join('&')}` : '';

    const list = await apiClient(`/settlements${q}`);
    if (statusFilter === 'all') {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
    return list;
  } catch (_) {
    const cached = await AsyncStorage.getItem(STORAGE_KEY);
    const list = cached ? JSON.parse(cached) : [];
    let filtered = propertyId ? list.filter((s) => s.propertyId === propertyId) : list;
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }
    return filtered;
  }
};

export const getSettlementsPaginated = async (propertyId, statusFilter = 'all', skip = 0, limit = 15) => {
  if (!propertyId) return { items: [], total: 0, hasMore: false };
  try {
    const params = [
      `propertyId=${encodeURIComponent(propertyId)}`,
      `skip=${skip}`,
      `limit=${limit}`,
    ];
    if (statusFilter && statusFilter !== 'all') {
      params.push(`status_filter=${encodeURIComponent(statusFilter)}`);
    }
    const res = await apiClient(`/settlements/paginated?${params.join('&')}`);
    return res;
  } catch (_) {
    const all = await getSettlementsByProperty(propertyId, statusFilter);
    const slice = all.slice(skip, skip + limit);
    return {
      items: slice,
      total: all.length,
      hasMore: skip + slice.length < all.length,
    };
  }
};

export const getPropertyBalances = async (propertyId) => {
  if (!propertyId) return null;
  try {
    const data = await apiClient(`/settlements/balances?propertyId=${encodeURIComponent(propertyId)}`);
    await AsyncStorage.setItem(`${BALANCES_KEY}_${propertyId}`, JSON.stringify(data));
    return data;
  } catch (_) {
    const cached = await AsyncStorage.getItem(`${BALANCES_KEY}_${propertyId}`);
    return cached ? JSON.parse(cached) : null;
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

export const updateSettlement = async (settlementId, updates) => {
  const updated = await apiClient(`/settlements/${settlementId}`, {
    method: 'PATCH',
    body: updates,
  });
  const cached = await AsyncStorage.getItem(STORAGE_KEY);
  if (cached) {
    const list = JSON.parse(cached);
    const nextList = list.map((s) => (s.id === settlementId || s._id === settlementId ? updated : s));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
  }
  return updated;
};

export const confirmSettlement = async (settlementId) => {
  const updated = await apiClient(`/settlements/${settlementId}/confirm`, {
    method: 'PATCH',
  });
  const cached = await AsyncStorage.getItem(STORAGE_KEY);
  if (cached) {
    const list = JSON.parse(cached);
    const nextList = list.map((s) => (s.id === settlementId || s._id === settlementId ? updated : s));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
  }
  return updated;
};

export const rejectSettlement = async (settlementId, reason = 'Payment not received') => {
  const updated = await apiClient(`/settlements/${settlementId}/reject`, {
    method: 'PATCH',
    body: { reason },
  });
  const cached = await AsyncStorage.getItem(STORAGE_KEY);
  if (cached) {
    const list = JSON.parse(cached);
    const nextList = list.map((s) => (s.id === settlementId || s._id === settlementId ? updated : s));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
  }
  return updated;
};

export const cancelSettlement = async (settlementId) => {
  const updated = await apiClient(`/settlements/${settlementId}/cancel`, {
    method: 'PATCH',
  });
  const cached = await AsyncStorage.getItem(STORAGE_KEY);
  if (cached) {
    const list = JSON.parse(cached);
    const nextList = list.map((s) => (s.id === settlementId || s._id === settlementId ? updated : s));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
  }
  return updated;
};

