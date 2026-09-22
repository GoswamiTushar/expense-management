import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { verifyOtp, resendOtp } from '../../../services/api/authApi';
import { styles } from './OtpVerificationModal.styles';

export default function OtpVerificationModal({ visible, email, onClose, onSuccess, initialOtp = '' }) {
  const [otp, setOtp] = useState(initialOtp || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  if (!visible) return null;

  const handleVerify = async () => {
    const code = otp.trim();
    if (!code || code.length < 6) return setError('Please enter the complete 6-digit code.');
    setLoading(true); setError('');
    try {
      const user = await verifyOtp({ email, otp: code });
      onSuccess(user); onClose();
    } catch (err) { setError(err.message || 'Invalid or expired code.'); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    try {
      await resendOtp({ email }); setError('');
      alert('A fresh 6-digit code was sent to your email.');
    } catch (err) { setError(err.message); }
  };

  return (
    <Modal visible={true} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}><Text style={styles.title}>Verify Your Email</Text><TouchableOpacity onPress={onClose}><Ionicons name="close" size={20} color={colors.textMuted} /></TouchableOpacity></View>
          <Text style={styles.sub}>Enter 6-digit code sent to <Text style={styles.emailText}>{email}</Text>.</Text>
          <Text style={styles.label}>6-DIGIT CODE</Text>
          <TextInput style={styles.input} placeholder="••••••" placeholderTextColor={colors.textDim} keyboardType="number-pad" maxLength={6} value={otp} onChangeText={(t) => { setOtp(t); setError(''); }} onSubmitEditing={handleVerify} autoFocus />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.verifyText}>Verify & Activate</Text>}
          </TouchableOpacity>
          <View style={styles.resendRow}><Text style={styles.resendPrompt}>Didn't receive it?</Text><TouchableOpacity onPress={handleResend}><Text style={styles.resendLink}>Resend Code</Text></TouchableOpacity></View>
        </View>
      </View>
    </Modal>
  );
}
