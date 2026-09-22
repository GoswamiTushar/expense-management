import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { acceptPropertyInvite } from '../../../services/api/inviteApi';
import { styles } from './AcceptInviteModal.styles';

export const AcceptInviteModal = ({ visible, onClose, onSuccess, currentUser }) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) return Alert.alert('Required', 'Please enter invite code.');
    if (!currentUser && (!name.trim() || !password.trim())) return Alert.alert('Required', 'Please enter name and password.');
    setLoading(true);
    try {
      const res = await acceptPropertyInvite({ inviteCode: code, userId: currentUser?._id, name, password });
      Alert.alert('Success', 'You joined the property!');
      onSuccess?.(res);
      onClose();
    } catch (err) { Alert.alert('Join Failed', err.message || 'Invalid code.'); }
    finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}><Text style={styles.title}>Join Property via Invite</Text><TouchableOpacity onPress={onClose}><Ionicons name="close" size={20} color={colors.textMuted} /></TouchableOpacity></View>
          <Text style={styles.sub}>{currentUser ? 'Enter code to add property to your account.' : 'Only for users who received an invite code.'}</Text>
          <Text style={styles.label}>INVITE CODE</Text>
          <TextInput style={styles.input} placeholder="INV-XXXXX" placeholderTextColor={colors.textMuted} autoCapitalize="characters" value={code} onChangeText={setCode} />
          {!currentUser && (
            <>
              <Text style={styles.label}>FULL NAME & PASSWORD</Text>
              <TextInput style={styles.input} placeholder="Your Name" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} />
              <TextInput style={[styles.input, { marginTop: 6 }]} placeholder="••••••••" placeholderTextColor={colors.textMuted} secureTextEntry value={password} onChangeText={setPassword} />
            </>
          )}
          <TouchableOpacity style={styles.joinBtn} onPress={handleJoin} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>Join Property</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
