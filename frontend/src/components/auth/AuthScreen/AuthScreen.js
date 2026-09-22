import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { styles } from './AuthScreen.styles';
import { signUpUser, signInUser } from '../../../services/api/authApi';
import AuthHeader from './AuthHeader';
import AuthFormInputs from './AuthFormInputs';
import GoogleSignInButton from './GoogleSignInButton';
import OtpVerificationModal from '../OtpVerificationModal/OtpVerificationModal';

export default function AuthScreen({ onAuthSuccess, onOpenInviteCode }) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [upiId, setUpiId] = useState('');
  const [showOtp, setShowOtp] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) return alert('Please enter email and password.');
    if (isSignUp && !name.trim()) return alert('Please enter your full name.');
    try {
      if (isSignUp) {
        await signUpUser({ name, email, password, upiId });
        setShowOtp(true);
      } else {
        onAuthSuccess(await signInUser({ email, password }));
      }
    } catch (err) { alert(err.message); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <AuthHeader isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
          <AuthFormInputs isSignUp={isSignUp} name={name} setName={setName} email={email} setEmail={setEmail} password={password} setPassword={setPassword} upiId={upiId} setUpiId={setUpiId} />
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
            <Text style={styles.submitText}>{isSignUp ? 'Create Manager Account' : 'Sign In to Account'}</Text>
          </TouchableOpacity>
          <GoogleSignInButton onAuthSuccess={onAuthSuccess} />
          <TouchableOpacity style={styles.inviteLinkBtn} onPress={onOpenInviteCode}>
            <Text style={styles.inviteLinkText}>Invited by a partner? Join with invite code</Text>
          </TouchableOpacity>
          <OtpVerificationModal visible={showOtp} email={email} onClose={() => setShowOtp(false)} onSuccess={onAuthSuccess} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
