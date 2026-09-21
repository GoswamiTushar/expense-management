import { apiClient } from './apiClient';
import { saveDeviceUserProfile } from '../storage/sessionStore';

export const createPropertyInvite = async (payload) => {
  return await apiClient('/invites', {
    method: 'POST',
    body: {
      propertyId: payload.propertyId,
      propertyName: payload.propertyName,
      invitedBy: payload.invitedBy,
      email: payload.email.trim().toLowerCase(),
    },
  });
};

export const getInviteByCode = async (code) => {
  const cleanCode = (code || '').trim().toUpperCase();
  return await apiClient(`/invites/${cleanCode}`);
};

export const acceptPropertyInvite = async (payload) => {
  const result = await apiClient('/invites/accept', {
    method: 'POST',
    body: {
      inviteCode: payload.inviteCode.trim().toUpperCase(),
      name: payload.name.trim(),
      password: payload.password,
      upiId: (payload.upiId || '').trim(),
    },
  });
  if (result.user) {
    await saveDeviceUserProfile(result.user);
  }
  return result;
};
