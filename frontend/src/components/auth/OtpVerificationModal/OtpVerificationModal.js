import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { verifyOtp, resendOtp } from '../../../services/api/authApi';
import { styles } from './OtpVerificationModal.styles';

export default function OtpVerificationModal({ visible, email, onClose, onSuccess }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp.trim() || otp.trim().length < 6) return Alert.alert('Invalid Code', 'Please enter 6-digit code.');
    setLoading(true);
    try {
      const user = await verifyOtp({ email, otp: otp.trim() });
      Alert.alert('Verified!', 'Your email has been verified.');
      onSuccess(user);
      onClose();
    } catch (err) { Alert.alert('Verification Failed', err.message); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    try {
      await resendOtp({ email });
      Alert.alert('Code Sent', 'A fresh code was sent to your email.');
    } catch (err) { Alert.alert('Resend Failed', err.message); }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}><Text style={styles.title}>Verify Your Email</Text><TouchableOpacity onPress={onClose}><Ionicons name="close" size={20} color={colors.textMuted} /></TouchableOpacity></View>
          <Text style={styles.sub}>Enter 6-digit code sent to <Text style={styles.emailText}>{email}</Text>.</Text>
          <Text style={styles.label}>6-DIGIT CODE</Text>
          <TextInput style={styles.input} placeholder="••••••" placeholderTextColor={colors.textDim} keyboardType="number-pad" maxLength={6} value={otp} onChangeText={setOtp} />
          <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.verifyText}>Verify & Activate</Text>}
          </TouchableOpacity>
          <View style={styles.resendRow}><Text style={styles.resendPrompt}>Didn't receive it?</Text><TouchableOpacity onPress={handleResend}><Text style={styles.resendLink}>Resend Code</Text></TouchableOpacity></View>
        </View>
      </View>
    </Modal>
  );
}
