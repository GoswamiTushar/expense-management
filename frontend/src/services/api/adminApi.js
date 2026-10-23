import { apiClient } from './apiClient';

export const getAdminUsers = async () => {
  return await apiClient('/admin/users');
};

export const resetUserPassword = async (userId, newPassword) => {
  return await apiClient(`/admin/users/${userId}/reset-password`, {
    method: 'POST',
    body: { newPassword },
  });
};

export const getAdminProperties = async () => {
  return await apiClient('/admin/properties');
};

export const getAdminExpenses = async (propertyId, userId) => {
  const params = [];
  if (propertyId && propertyId !== 'all') params.push(`propertyId=${encodeURIComponent(propertyId)}`);
  if (userId && userId !== 'all') params.push(`userId=${encodeURIComponent(userId)}`);
  const q = params.length ? `?${params.join('&')}` : '';
  return await apiClient(`/admin/expenses${q}`);
};
