import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './InvitePartnerModal.styles';
import { colors } from '../../../theme/colors';
import { createPropertyInvite } from '../../../services/api/inviteApi';
import InviteCodeDisplay from './InviteCodeDisplay';

export default function InvitePartnerModal({ visible, onClose, property, currentUser }) {
  const [email, setEmail] = useState('');
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(false);
  if (!visible) return null;

  const handleCreate = async () => {
    if (!email.trim() || !email.includes('@')) return alert('Please enter a valid email address.');
    setLoading(true);
    try {
      const res = await createPropertyInvite({ propertyId: property?._id, propertyName: property?.name, invitedBy: currentUser?.name || 'Property Owner', email: email.trim(), inviterEmail: currentUser?.email || '' });
      setInvite(res);
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handleSendEmail = () => {
    if (!invite) return;
    const s = encodeURIComponent(`Invitation to manage ${property?.name}`);
    const b = encodeURIComponent(`Join "${property?.name}". Code: ${invite.code}\n\nBest,\n${currentUser?.name}`);
    Linking.openURL(`mailto:${invite.email}?subject=${s}&body=${b}`);
  };

  return (
    <Modal visible={true} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}><Text style={styles.title}>Invite Co-Manager</Text><TouchableOpacity onPress={onClose}><Ionicons name="close" size={20} color={colors.textMuted} /></TouchableOpacity></View>
          <Text style={styles.sub}>Invite your friend to {property?.name}.</Text>
          <Text style={styles.label}>FRIEND'S EMAIL ADDRESS</Text>
          <TextInput style={styles.input} placeholder="friend@example.com" placeholderTextColor={colors.textDim} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          {!invite ? (
            <TouchableOpacity style={styles.genBtn} onPress={handleCreate} disabled={loading} activeOpacity={0.8}>
              {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.genText}>Generate Partner Invite</Text>}
            </TouchableOpacity>
          ) : ( <InviteCodeDisplay code={invite.code} onSendEmail={handleSendEmail} /> )}
        </View>
      </View>
    </Modal>
  );
}
