import { apiClient } from './apiClient';
import { saveDeviceUserProfile, clearDeviceUserProfile } from '../storage/sessionStore';

export const signUpUser = async ({ name, email, password, upiId = '' }) => {
  const user = await apiClient('/auth/signup', {
    method: 'POST',
    body: { name, email, password, upiId },
  });
  await saveDeviceUserProfile(user);
  return user;
};

export const signInUser = async ({ email, password }) => {
  const user = await apiClient('/auth/signin', {
    method: 'POST',
    body: { email, password },
  });
  await saveDeviceUserProfile(user);
  return user;
};

export const signInWithGoogle = async (idToken, upiId = '') => {
  const user = await apiClient('/auth/google', {
    method: 'POST',
    body: { id_token: idToken, upiId },
  });
  await saveDeviceUserProfile(user);
  return user;
};

export const logoutUser = async () => {
  await clearDeviceUserProfile();
};
