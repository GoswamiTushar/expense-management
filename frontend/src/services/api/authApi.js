import { apiClient } from './apiClient';
import { saveDeviceUserProfile, clearDeviceUserProfile, saveTokens, clearTokens } from '../storage/sessionStore';

export const signUpUser = async ({ name, email, password, upiId = '' }) => {
  return await apiClient('/auth/signup', {
    method: 'POST',
    body: { name, email, password, upiId },
  });
};

export const verifyOtp = async ({ email, otp }) => {
  const res = await apiClient('/auth/verify-otp', {
    method: 'POST',
    body: { email, otp },
  });
  // Response: { user, accessToken, refreshToken }
  await saveTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
  await saveDeviceUserProfile(res.user);
  return res.user;
};

export const resendOtp = async ({ email }) => {
  return await apiClient('/auth/resend-otp', {
    method: 'POST',
    body: { email },
  });
};

export const signInUser = async ({ email, password }) => {
  const res = await apiClient('/auth/signin', {
    method: 'POST',
    body: { email, password },
  });
  // Response: { user, accessToken, refreshToken }
  await saveTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
  await saveDeviceUserProfile(res.user);
  return res.user;
};

export const logoutUser = async () => {
  await clearTokens();
  await clearDeviceUserProfile();
};
