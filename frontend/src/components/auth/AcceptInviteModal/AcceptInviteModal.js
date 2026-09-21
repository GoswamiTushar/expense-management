import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { acceptPropertyInvite } from '../../../services/api/inviteApi';
import { styles } from './AcceptInviteModal.styles';

export const AcceptInviteModal = ({ visible, onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim() || !name.trim() || !password.trim()) return Alert.alert('Required', 'Please fill all fields.');
    setLoading(true);
    try {
      const res = await acceptPropertyInvite({ inviteCode: code, name, password, upiId });
      Alert.alert('Welcome!', 'You joined successfully.');
      onSuccess?.(res);
      onClose();
    } catch (err) {
      Alert.alert('Join Failed', err.message || 'Invalid invite code.');
    } finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}><Text style={styles.title}>Join Property via Invite</Text><TouchableOpacity onPress={onClose}><Ionicons name="close" size={20} color={colors.textMuted} /></TouchableOpacity></View>
          <Text style={styles.sub}>Enter the code sent to your email.</Text>
          <Text style={styles.label}>INVITE CODE</Text>
          <TextInput style={styles.input} placeholder="INV-XXXXX" placeholderTextColor={colors.textMuted} autoCapitalize="characters" value={code} onChangeText={setCode} />
          <Text style={styles.label}>FULL NAME</Text>
          <TextInput style={styles.input} placeholder="e.g. Rahul Verma" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} />
          <Text style={styles.label}>PASSWORD</Text>
          <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor={colors.textMuted} secureTextEntry value={password} onChangeText={setPassword} />
          <Text style={styles.label}>UPI ID (OPTIONAL)</Text>
          <TextInput style={styles.input} placeholder="e.g. rahul@oksbi" placeholderTextColor={colors.textMuted} autoCapitalize="none" value={upiId} onChangeText={setUpiId} />
          <TouchableOpacity style={styles.joinBtn} onPress={handleJoin} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>Join & Activate Account</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
