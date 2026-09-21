import React from 'react';
import { Text, TextInput } from 'react-native';
import { styles } from './AuthScreen.styles';
import { colors } from '../../../theme/colors';

export default function AuthFormInputs({ isSignUp, name, setName, email, setEmail, password, setPassword, upiId, setUpiId }) {
  return (
    <>
      {isSignUp && (
        <>
          <Text style={styles.label}>FULL NAME</Text>
          <TextInput style={styles.input} placeholder="e.g. Tushar Goswami" placeholderTextColor={colors.textDim} value={name} onChangeText={setName} />
        </>
      )}
      <Text style={styles.label}>EMAIL ADDRESS</Text>
      <TextInput style={styles.input} placeholder="name@example.com" placeholderTextColor={colors.textDim} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <Text style={styles.label}>PASSWORD</Text>
      <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor={colors.textDim} secureTextEntry value={password} onChangeText={setPassword} />
      {isSignUp && (
        <>
          <Text style={styles.label}>UPI ID (OPTIONAL - FOR REIMBURSEMENTS)</Text>
          <TextInput style={styles.input} placeholder="e.g. yourname@okhdfcbank" placeholderTextColor={colors.textDim} autoCapitalize="none" value={upiId} onChangeText={setUpiId} />
        </>
      )}
    </>
  );
}
