/**
 * Centralized Configuration for API & Push Endpoints.
 */
export const CONFIG = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://expense-management-fmh3.onrender.com/api',
  EXPO_PUSH_ENDPOINT: 'https://exp.host/--/api/v2/push/send',
};
