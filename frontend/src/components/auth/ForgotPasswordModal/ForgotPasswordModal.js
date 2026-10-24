import React, { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createForgotPasswordStyles } from './ForgotPasswordModal.styles';
import { useTheme } from '../../../context/ThemeContext';
import {
  requestPasswordReset,
  verifyResetOtp,
  resetPassword,
} from '../../../services/api/authApi';

const STEPS = {
  EMAIL: 'EMAIL',
  OTP: 'OTP',
  NEW_PASSWORD: 'NEW_PASSWORD',
};

export default function ForgotPasswordModal({
  visible,
  initialEmail = '',
  onClose,
  onSuccess,
}) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createForgotPasswordStyles(colors, isDark), [colors, isDark]);

  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState(initialEmail || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (visible) {
      setStep(STEPS.EMAIL);
      setEmail(initialEmail || '');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccessMsg('');
    }
  }, [visible, initialEmail]);

  if (!visible) return null;

  // Step 1: Request Password Reset OTP
  const handleRequestOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return setError('Please enter a valid email address.');
    }
    setLoading(true);
    setError('');
    try {
      await requestPasswordReset({ email: cleanEmail });
      setEmail(cleanEmail);
      setStep(STEPS.OTP);
    } catch (err) {
      setError(err.message || 'Unable to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      return setError('Please enter the complete 6-digit confirmation code.');
    }
    setLoading(true);
    setError('');
    try {
      await verifyResetOtp({ email, otp: cleanOtp });
      setStep(STEPS.NEW_PASSWORD);
    } catch (err) {
      setError(err.message || 'Invalid or expired confirmation code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resending) return;
    setResending(true);
    setError('');
    try {
      await requestPasswordReset({ email });
      setSuccessMsg('A fresh 6-digit code was sent to your email.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  // Step 3: Set New Password
  const handleSetNewPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      return setError('New password must be at least 6 characters.');
    }
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match. Please re-enter.');
    }
    setLoading(true);
    setError('');
    try {
      const user = await resetPassword({
        email,
        otp: otp.trim(),
        newPassword,
      });
      onSuccess?.(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={true} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleGroup}>
              <View style={styles.iconBubble}>
                <Ionicons name="key-outline" size={18} color="#F43F5E" />
              </View>
              <Text style={styles.title}>
                {step === STEPS.EMAIL && 'Reset Password'}
                {step === STEPS.OTP && 'Verify Code'}
                {step === STEPS.NEW_PASSWORD && 'New Password'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={loading} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Progress indicators */}
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={[styles.stepDot, step !== STEPS.EMAIL && styles.stepDotActive]} />
            <View style={[styles.stepDot, step === STEPS.NEW_PASSWORD && styles.stepDotActive]} />
          </View>

          {/* Step 1: Email Form */}
          {step === STEPS.EMAIL && (
            <>
              <Text style={styles.sub}>
                Enter your registered email address. We'll send you a 6-digit verification code to reset your password.
              </Text>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor={colors.textDim}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setError('');
                }}
                onSubmitEditing={handleRequestOtp}
                autoFocus
                editable={!loading}
              />
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
              <TouchableOpacity
                style={[styles.actionBtn, loading && { opacity: 0.85 }]}
                onPress={handleRequestOtp}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color={colors.white} />
                    <Text style={styles.actionBtnText}>Sending Code...</Text>
                  </View>
                ) : (
                  <Text style={styles.actionBtnText}>Send Reset Code</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Step 2: OTP Verification Form */}
          {step === STEPS.OTP && (
            <>
              <Text style={styles.sub}>
                Enter the 6-digit code sent to <Text style={styles.emailHighlight}>{email}</Text>.
              </Text>
              <Text style={styles.label}>6-DIGIT CODE</Text>
              <TextInput
                style={styles.otpInput}
                placeholder="••••••"
                placeholderTextColor={colors.textDim}
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={(t) => {
                  setOtp(t);
                  setError('');
                }}
                onSubmitEditing={handleVerifyOtp}
                autoFocus
                editable={!loading}
              />
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
              {successMsg ? (
                <Text style={{ color: '#10B981', fontSize: 12, textAlign: 'center', marginTop: 8, fontWeight: '600' }}>
                  {successMsg}
                </Text>
              ) : null}
              <TouchableOpacity
                style={[styles.actionBtn, loading && { opacity: 0.85 }]}
                onPress={handleVerifyOtp}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color={colors.white} />
                    <Text style={styles.actionBtnText}>Confirming Code...</Text>
                  </View>
                ) : (
                  <Text style={styles.actionBtnText}>Verify Code</Text>
                )}
              </TouchableOpacity>
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Didn't receive code?</Text>
                <TouchableOpacity onPress={handleResendOtp} disabled={resending}>
                  {resending ? (
                    <Text style={styles.footerLink}>Sending...</Text>
                  ) : (
                    <Text style={styles.footerLink}>Resend Code</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Step 3: New Password Form */}
          {step === STEPS.NEW_PASSWORD && (
            <>
              <Text style={styles.sub}>
                Your identity has been verified. Choose a secure new password for your account.
              </Text>
              <Text style={styles.label}>NEW PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textDim}
                secureTextEntry
                value={newPassword}
                onChangeText={(t) => {
                  setNewPassword(t);
                  setError('');
                }}
                autoFocus
                editable={!loading}
              />
              <Text style={styles.label}>CONFIRM NEW PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="Re-enter new password"
                placeholderTextColor={colors.textDim}
                secureTextEntry
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  setError('');
                }}
                onSubmitEditing={handleSetNewPassword}
                editable={!loading}
              />
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
              <TouchableOpacity
                style={[styles.actionBtn, loading && { opacity: 0.85 }]}
                onPress={handleSetNewPassword}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color={colors.white} />
                    <Text style={styles.actionBtnText}>Updating Password...</Text>
                  </View>
                ) : (
                  <Text style={styles.actionBtnText}>Save Password &amp; Sign In</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
