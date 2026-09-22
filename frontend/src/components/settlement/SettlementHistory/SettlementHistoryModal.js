import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './SettlementHistoryModal.styles';
import { colors } from '../../../theme/colors';
import { formatCurrency } from '../../../utils/currency';
import { formatDateTime } from '../../../utils/date';

export default function SettlementHistoryModal({ visible, onClose, settlements = [] }) {
  if (!visible) return null;

  return (
    <Modal visible={true} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Settlement History</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={20} color={colors.textMuted} /></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {settlements.length === 0 ? (
              <Text style={{ color: colors.textMuted, textAlign: 'center', paddingVertical: 24 }}>No settlements recorded yet.</Text>
            ) : (
              settlements.map((s) => (
                <View key={s._id} style={styles.item}>
                  <View style={styles.top}>
                    <Text style={styles.parties}>{s.settledByName || s.settledBy} ➔ {s.paidToName || s.paidTo}</Text>
                    <Text style={styles.amount}>{formatCurrency(s.amount)}</Text>
                  </View>
                  <Text style={styles.date}>{formatDateTime(s.settledAt)}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
