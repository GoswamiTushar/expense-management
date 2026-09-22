import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'airbnb_user_session';
const ACCESS_TOKEN_KEY = 'airbnb_access_token';
const REFRESH_TOKEN_KEY = 'airbnb_refresh_token';

// ── User profile ─────────────────────────────────────────────────────────────

export const getDeviceUserProfile = async () => {
  try {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveDeviceUserProfile = async (profile) => {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(profile));
  return profile;
};

export const clearDeviceUserProfile = async () => {
  await SecureStore.deleteItemAsync(SESSION_KEY);
};

// ── Auth tokens ───────────────────────────────────────────────────────────────

export const getAccessToken = async () => {
  try { return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY); }
  catch { return null; }
};

export const getRefreshToken = async () => {
  try { return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY); }
  catch { return null; }
};

export const saveTokens = async ({ accessToken, refreshToken }) => {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
};
