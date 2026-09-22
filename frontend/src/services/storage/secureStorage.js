/**
 * Cross-platform secure storage.
 * - Native (iOS/Android): expo-secure-store (device keychain/keystore)
 * - Web: localStorage (acceptable on web since there's no native keychain)
 *
 * API matches SecureStore: getItemAsync / setItemAsync / deleteItemAsync
 */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const webStore = {
  getItemAsync: async (key) => {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  setItemAsync: async (key, value) => {
    try { localStorage.setItem(key, value); } catch {}
  },
  deleteItemAsync: async (key) => {
    try { localStorage.removeItem(key); } catch {}
  },
};

export const store = Platform.OS === 'web' ? webStore : SecureStore;
