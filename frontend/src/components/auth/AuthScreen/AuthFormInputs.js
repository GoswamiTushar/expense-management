import React from 'react';
import { Text, TextInput } from 'react-native';
import { styles as defaultStyles } from './AuthScreen.styles';
import { colors } from '../../../theme/colors';

export default function AuthFormInputs({ isSignUp, name, setName, email, setEmail, password, setPassword, upiId, setUpiId, styles = defaultStyles }) {
  return (
    <>
      {isSignUp && (
        <>
          <Text style={styles.label}>FULL NAME</Text>
          <TextInput style={styles.input} placeholder="e.g. Tushar Goswami" placeholderTextColor={colors.textDim} value={name} onChangeText={setName} />
        </>
      )}
      <Text style={styles.label}>{isSignUp ? 'EMAIL ADDRESS' : 'EMAIL OR USERNAME'}</Text>
      <TextInput
        style={styles.input}
        placeholder={isSignUp ? 'name@example.com' : 'name@example.com or admin'}
        placeholderTextColor={colors.textDim}
        keyboardType={isSignUp ? 'email-address' : 'default'}
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
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
