import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './apiClient';

const STORAGE_KEY = '@airbnb_expenses_live';

export const getExpensesByProperty = async (propertyId) => {
  if (!propertyId) return [];
  try {
    const list = await apiClient(`/expenses?propertyId=${propertyId}`);
    await AsyncStorage.setItem(`${STORAGE_KEY}_${propertyId}`, JSON.stringify(list));
    return list;
  } catch (_) {
    const cached = await AsyncStorage.getItem(`${STORAGE_KEY}_${propertyId}`);
    if (!cached) return [];
    const parsed = JSON.parse(cached);
    return parsed.filter(e => !e.isDeleted && !e.deleted && e.deleted !== 'Y' && e.isDeleted !== 'Y');
  }
};

export const getExpensesPaginated = async (propertyId, skip = 0, limit = 15) => {
  if (!propertyId) return { items: [], total: 0, hasMore: false };
  try {
    const res = await apiClient(
      `/expenses/paginated?propertyId=${encodeURIComponent(propertyId)}&skip=${skip}&limit=${limit}`
    );
    return res;
  } catch (_) {
    const all = await getExpensesByProperty(propertyId);
    const slice = all.slice(skip, skip + limit);
    return {
      items: slice,
      total: all.length,
      hasMore: skip + slice.length < all.length,
    };
  }
};

export const createExpense = async (expense) => {
  const newExp = await apiClient('/expenses', {
    method: 'POST',
    body: expense,
  });
  const cached = await AsyncStorage.getItem(`${STORAGE_KEY}_${expense.propertyId}`);
  const list = cached ? JSON.parse(cached) : [];
  await AsyncStorage.setItem(`${STORAGE_KEY}_${expense.propertyId}`, JSON.stringify([newExp, ...list]));
  return newExp;
};

export const updateExpense = async (expenseId, payload, propertyId) => {
  const updated = await apiClient(`/expenses/${expenseId}`, {
    method: 'PUT',
    body: payload,
  });
  const propId = propertyId || updated.propertyId;
  if (propId) {
    const cached = await AsyncStorage.getItem(`${STORAGE_KEY}_${propId}`);
    if (cached) {
      const list = JSON.parse(cached);
      const next = list.map((e) => ((e._id === expenseId || e.id === expenseId) ? updated : e));
      await AsyncStorage.setItem(`${STORAGE_KEY}_${propId}`, JSON.stringify(next));
    }
  }
  return updated;
};

export const deleteExpense = async (expenseId, reason, propertyId) => {
  const res = await apiClient(`/expenses/${expenseId}`, {
    method: 'DELETE',
    body: reason ? { reason } : undefined,
  });
  if (res?.status === 'deleted' && propertyId) {
    const cached = await AsyncStorage.getItem(`${STORAGE_KEY}_${propertyId}`);
    if (cached) {
      const list = JSON.parse(cached);
      const next = list.filter((e) => (e._id !== expenseId && e.id !== expenseId));
      await AsyncStorage.setItem(`${STORAGE_KEY}_${propertyId}`, JSON.stringify(next));
    }
  }
  return res;
};

export const approveDeleteExpense = async (expenseId, propertyId) => {
  const res = await apiClient(`/expenses/${expenseId}/approve-delete`, {
    method: 'PATCH',
  });
  if (res?.status === 'deleted' && propertyId) {
    const cached = await AsyncStorage.getItem(`${STORAGE_KEY}_${propertyId}`);
    if (cached) {
      const list = JSON.parse(cached);
      const next = list.filter((e) => (e._id !== expenseId && e.id !== expenseId));
      await AsyncStorage.setItem(`${STORAGE_KEY}_${propertyId}`, JSON.stringify(next));
    }
  }
  return res;
};

export const rejectDeleteExpense = async (expenseId, reason) => {
  return await apiClient(`/expenses/${expenseId}/reject-delete`, {
    method: 'PATCH',
    body: reason ? { reason } : undefined,
  });
};

export const cancelDeleteExpense = async (expenseId) => {
  return await apiClient(`/expenses/${expenseId}/cancel-delete`, {
    method: 'PATCH',
  });
};
