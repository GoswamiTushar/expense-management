import { CONFIG } from '../../config/urls';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens, clearDeviceUserProfile } from '../storage/sessionStore';
import { apiTracker } from './apiTracker';

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

// Request timeout (ms) — generous for Render free-tier cold starts
const REQUEST_TIMEOUT_MS = 45000;

// Internal fetch wrapper — does not retry on 401
const _fetch = async (path, options = {}, accessToken = null) => {
  const url = `${CONFIG.API_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
    return res;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. The server is taking too long to respond. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

// Public API client — attaches token and handles 401 → refresh → retry
export const apiClient = async (path, options = {}) => {
  apiTracker.startRequest();
  try {
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
  } finally {
    apiTracker.endRequest();
  }
};
