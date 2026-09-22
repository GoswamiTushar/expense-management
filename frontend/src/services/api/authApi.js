import { apiClient } from './apiClient';
import { saveDeviceUserProfile, clearDeviceUserProfile, saveTokens, clearTokens } from '../storage/sessionStore';

// Ensure both id and _id are always present on user objects
const normalizeUser = (user) => ({
  ...user,
  id: user.id || user._id,
  _id: user._id || user.id,
});

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
  const user = normalizeUser(res.user);
  await saveTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
  await saveDeviceUserProfile(user);
  return user;
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
  const user = normalizeUser(res.user);
  await saveTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
  await saveDeviceUserProfile(user);
  return user;
};

export const logoutUser = async () => {
  await clearTokens();
  await clearDeviceUserProfile();
};
