import React, { useState } from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './AuthScreen.styles';
import { signInWithGoogle } from '../../../services/api/authApi';

export default function GoogleSignInButton({ onAuthSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    try {
      setLoading(true);
      const email = typeof window !== 'undefined' && window.prompt
        ? window.prompt('Enter Google Account email for SSO:', 'tushargoswami1510@gmail.com')
        : 'tushargoswami1510@gmail.com';
      if (!email) { setLoading(false); return; }
      const token = `mock_google_${email.trim().toLowerCase()}`;
      const user = await signInWithGoogle(token);
      onAuthSuccess(user);
    } catch (err) {
      alert(err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>
      <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} activeOpacity={0.8} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#1F2937" size="small" />
        ) : (
          <>
            <Ionicons name="logo-google" size={18} color="#EA4335" />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </>
        )}
      </TouchableOpacity>
    </>
  );
}
