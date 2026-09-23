import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { styles } from './AuthScreen.styles';
import { colors } from '../../../theme/colors';
import { signUpUser, signInUser } from '../../../services/api/authApi';
import AuthHeader from './AuthHeader';
import AuthFormInputs from './AuthFormInputs';
import OtpVerificationModal from '../OtpVerificationModal/OtpVerificationModal';

export default function AuthScreen({
  onAuthSuccess,
  onOpenInviteCode,
  initialOtp = '',
  initialEmail = '',
}) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail || '');
  const [password, setPassword] = useState('');
  const [upiId, setUpiId] = useState('');
  const [showOtp, setShowOtp] = useState(Boolean(initialOtp && initialEmail));
  const [loading, setLoading] = useState(false);
  const [slowNotice, setSlowNotice] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) return alert('Please enter email and password.');
    if (isSignUp && !name.trim()) return alert('Please enter your full name.');
    setLoading(true);
    setSlowNotice(false);

    const timer = setTimeout(() => {
      setSlowNotice(true);
    }, 2500);

    try {
      if (isSignUp) {
        await signUpUser({ name, email, password, upiId });
        setShowOtp(true);
      } else {
        const user = await signInUser({ email, password });
        onAuthSuccess(user);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      clearTimeout(timer);
      setLoading(false);
      setSlowNotice(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <AuthHeader isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
          <AuthFormInputs
            isSignUp={isSignUp}
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            upiId={upiId}
            setUpiId={setUpiId}
          />
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.85 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <ActivityIndicator size="small" color={colors.white} />
                <Text style={styles.submitText}>
                  {isSignUp ? 'Creating Account...' : 'Connecting & Signing In...'}
                </Text>
              </View>
            ) : (
              <Text style={styles.submitText}>
                {isSignUp ? 'Create Manager Account' : 'Sign In to Account'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Render cold-start reassurance */}
          {slowNotice && (
            <View
              style={{
                marginTop: 10,
                padding: 10,
                borderRadius: 8,
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                borderWidth: 1,
                borderColor: 'rgba(56, 189, 248, 0.25)',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 11, color: '#38BDF8', textAlign: 'center', fontWeight: '600' }}>
                Connecting to cloud server...
              </Text>
              <Text style={{ fontSize: 10, color: colors.textMuted, textAlign: 'center', marginTop: 2 }}>
                Establishing secure session with database. Please wait a moment.
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.inviteLinkBtn} onPress={onOpenInviteCode}>
            <Text style={styles.inviteLinkText}>Invited by a partner? Join with invite code</Text>
          </TouchableOpacity>
          <OtpVerificationModal
            visible={showOtp}
            email={email}
            initialOtp={initialOtp}
            onClose={() => setShowOtp(false)}
            onSuccess={onAuthSuccess}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
