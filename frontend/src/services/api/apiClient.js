import { CONFIG } from '../../config/urls';

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

export const apiClient = async (path, options = {}) => {
  const url = `${CONFIG.API_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const errorText = await res.text();
    let msg = errorText;
    try { msg = JSON.parse(errorText).detail || errorText; } catch (_) {}
    throw new Error(msg || `Request failed (${res.status})`);
  }
  const json = await res.json();
  return normalize(json);
};
