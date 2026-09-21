/**
 * Centralized Configuration for all API, Database, S3 & Push Endpoints.
 * Values are dynamically loaded from environment variables (.env).
 */
export const CONFIG = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api',
  S3_UPLOAD_ENDPOINT: process.env.EXPO_PUBLIC_S3_UPLOAD_ENDPOINT || '',
  EXPO_PUSH_ENDPOINT: process.env.EXPO_PUBLIC_PUSH_ENDPOINT || 'https://exp.host/--/api/v2/push/send',
};
