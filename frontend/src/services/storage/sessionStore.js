import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@airbnb_user_session_live';

export const getDeviceUserProfile = async () => {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
};

export const saveDeviceUserProfile = async (profile) => {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(profile));
  return profile;
};

export const clearDeviceUserProfile = async () => {
  await AsyncStorage.removeItem(SESSION_KEY);
};
