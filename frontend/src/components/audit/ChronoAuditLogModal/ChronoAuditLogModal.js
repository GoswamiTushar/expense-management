import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './ChronoAuditLogModal.styles';
import { colors } from '../../../theme/colors';
import { formatCurrency } from '../../../utils/currency';
import { formatDateTime } from '../../../utils/date';

export default function ChronoAuditLogModal({ visible, onClose, expenses = [] }) {
  if (!visible) return null;

  const sorted = [...expenses].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

  return (
    <Modal visible={true} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="time" size={18} color={colors.primary} />
              <Text style={styles.title}>Chronological Expense Log</Text>
            </View>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={20} color={colors.textMuted} /></TouchableOpacity>
          </View>
          <Text style={styles.sub}>Exact chronological timeline of who logged which expense and notes.</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {sorted.length === 0 ? (
              <Text style={{ color: colors.textMuted, textAlign: 'center', paddingVertical: 24 }}>No expense logs yet.</Text>
            ) : (
              sorted.map((exp) => (
                <View key={exp._id} style={styles.item}>
                  <View style={styles.itemTop}>
                    <Text style={styles.actor}>{exp.payerName || exp.paidBy}</Text>
                    <Text style={styles.amount}>{formatCurrency(exp.amount)}</Text>
                  </View>
                  <Text style={styles.desc}>"{exp.title}" • {exp.category}{exp.notes ? ` • Note: ${exp.notes}` : ''}</Text>
                  <Text style={styles.time}>{formatDateTime(exp.createdAt || exp.date)}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
