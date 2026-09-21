import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './InvitePartnerModal.styles';
import { colors } from '../../../theme/colors';

export default function InviteCodeDisplay({ code, onSendEmail }) {
  return (
    <View style={styles.resultBox}>
      <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center' }}>INVITE SENT & CODE CREATED</Text>
      <View style={styles.codePill}><Text style={styles.codeText}>{code}</Text></View>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onSendEmail}><Text style={styles.actionText}>Open Email</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => alert(`Invite Code: ${code}`)}><Text style={styles.actionText}>Copy Code</Text></TouchableOpacity>
      </View>
    </View>
  );
}
