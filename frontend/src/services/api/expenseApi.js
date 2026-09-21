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
    return cached ? JSON.parse(cached) : [];
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

export const deleteExpense = async (expenseId) => {
  return await apiClient(`/expenses/${expenseId}`, { method: 'DELETE' });
};
