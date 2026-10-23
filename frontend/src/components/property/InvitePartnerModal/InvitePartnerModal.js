import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Linking, ActivityIndicator, Animated, Platform, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createInvitePartnerStyles, styles as defaultStyles } from './InvitePartnerModal.styles';
import { useTheme } from '../../../context/ThemeContext';
import { createPropertyInvite } from '../../../services/api/inviteApi';
import InviteCodeDisplay from './InviteCodeDisplay';

export default function InvitePartnerModal({ visible, onClose, property, currentUser }) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createInvitePartnerStyles(colors, isDark), [colors, isDark]);
  const [email, setEmail] = useState('');
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.92);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 120,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = (callback) => {
    if (loading) return;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.94,
        duration: 180,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      onClose();
      if (typeof callback === 'function') callback();
    });
  };

  if (!visible) return null;

  const handleCreate = async () => {
    if (!email.trim() || !email.includes('@')) return alert('Please enter a valid email address.');
    setLoading(true);
    try {
      const res = await createPropertyInvite({ propertyId: property?._id, propertyName: property?.name, invitedBy: currentUser?.name || 'Group Member', email: email.trim(), inviterEmail: currentUser?.email || '' });
      setInvite(res);
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handleSendEmail = () => {
    if (!invite) return;
    const s = encodeURIComponent(`Invitation to join ${property?.name}`);
    const b = encodeURIComponent(`Join "${property?.name}". Code: ${invite.code}\n\nBest,\n${currentUser?.name}`);
    Linking.openURL(`mailto:${invite.email}?subject=${s}&body=${b}`);
  };

  return (
    <Modal visible={true} transparent onRequestClose={() => handleClose()}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableWithoutFeedback onPress={() => handleClose()}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        </TouchableWithoutFeedback>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Invite Member</Text>
            <TouchableOpacity onPress={() => handleClose()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.sub}>Invite someone to join {property?.name}.</Text>
          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <TextInput style={styles.input} placeholder="friend@example.com" placeholderTextColor={colors.textDim} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          {!invite ? (
            <TouchableOpacity style={styles.genBtn} onPress={handleCreate} disabled={loading} activeOpacity={0.8}>
              {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.genText}>Generate Invite Code</Text>}
            </TouchableOpacity>
          ) : ( <InviteCodeDisplay code={invite.code} onSendEmail={handleSendEmail} /> )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
