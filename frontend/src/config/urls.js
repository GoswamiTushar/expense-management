/**
 * Centralized Configuration for API & Push Endpoints.
 */
export const CONFIG = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api',
  EXPO_PUSH_ENDPOINT: 'https://exp.host/--/api/v2/push/send',
};
