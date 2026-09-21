import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './EditProfileModal.styles';
import { colors } from '../../../theme/colors';

export default function EditProfileModal({ visible, onClose, currentUser, onSaveProfile, onLogout }) {
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    if (visible && currentUser) {
      setName(currentUser.name || '');
      setUpiId(currentUser.upiId || '');
    }
  }, [visible, currentUser]);

  const handleSave = () => {
    if (!name.trim()) return alert('Please enter your name.');
    onSaveProfile({
      ...currentUser,
      name: name.trim(),
      upiId: upiId.trim(),
      initials: name.trim().split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Your Profile & UPI ID</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={20} color={colors.textMuted} /></TouchableOpacity>
          </View>
          <Text style={styles.label}>YOUR FULL NAME</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Tushar Goswami" placeholderTextColor={colors.textDim} />
          <Text style={styles.label}>YOUR UPI ID (TO RECEIVE REIMBURSEMENTS)</Text>
          <TextInput style={styles.input} value={upiId} onChangeText={setUpiId} placeholder="e.g. yourname@okhdfcbank" placeholderTextColor={colors.textDim} autoCapitalize="none" />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}><Text style={styles.btnText}>Save UPI Profile</Text></TouchableOpacity>
          {onLogout && (
            <TouchableOpacity style={styles.logoutBtn} onPress={() => { onClose(); onLogout(); }}><Text style={styles.logoutText}>Log Out</Text></TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
