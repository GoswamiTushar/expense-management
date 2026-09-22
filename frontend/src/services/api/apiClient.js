import { CONFIG } from '../../config/urls';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens, clearDeviceUserProfile } from '../storage/sessionStore';

const normalizeDoc = (item) => {
  if (item && typeof item === 'object' && !Array.isArray(item)) {
    if (item.id && !item._id) item._id = item.id;
    if (item._id && !item.id) item.id = item._id;
  }
  return item;
};

const normalize = (data) => {
  if (Array.isArray(data)) return data.map(normalizeDoc);
  return normalizeDoc(data);
};

// Internal fetch wrapper — does not retry on 401
const _fetch = async (path, options = {}, accessToken = null) => {
  const url = `${CONFIG.API_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return res;
};

// Public API client — attaches token and handles 401 → refresh → retry
export const apiClient = async (path, options = {}) => {
  let accessToken = await getAccessToken();

  let res = await _fetch(path, options, accessToken);

  // Token expired — attempt silent refresh once
  if (res.status === 401 && !options._isRetry) {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      try {
        const refreshRes = await _fetch('/auth/refresh', {
          method: 'POST',
          body: { refreshToken },
        });
        if (refreshRes.ok) {
          const tokens = await refreshRes.json();
          await saveTokens(tokens);
          // Retry the original request with the new access token
          res = await _fetch(path, { ...options, _isRetry: true }, tokens.accessToken);
        } else {
          // Refresh token also expired — force logout
          await clearTokens();
          await clearDeviceUserProfile();
          throw new Error('SESSION_EXPIRED');
        }
      } catch (err) {
        if (err.message === 'SESSION_EXPIRED') throw err;
        // Network error during refresh — fall through to handle original 401
      }
    }
  }

  if (!res.ok) {
    const errorText = await res.text();
    let msg = errorText;
    try { msg = JSON.parse(errorText).detail || errorText; } catch (_) {}
    throw new Error(msg || `Request failed (${res.status})`);
  }

  const json = await res.json();
  return normalize(json);
};
