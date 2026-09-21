import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './BalanceCard.styles';
import { colors } from '../../../theme/colors';
import { formatCurrency } from '../../../utils/currency';

export default function BalanceCard({ property, balanceData, onAddExpense, onSettleUp }) {
  const net = balanceData?.currentUserNet || 0;
  const isOwed = net > 0;
  const owes = net < 0;

  const statusTitle = isOwed ? 'YOU ARE OWED' : owes ? 'YOU OWE' : 'ALL SETTLED UP';
  const badgeColor = isOwed ? colors.success : owes ? colors.warning : colors.info;
  const subText = isOwed
    ? 'Co-managers owe you for logged expenses'
    : owes
    ? 'Pending reimbursement to co-managers'
    : 'Zero pending dues on this property';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.statusPill}>
          <View style={[styles.dot, { backgroundColor: badgeColor }]} />
          <Text style={[styles.statusText, { color: badgeColor }]}>{statusTitle}</Text>
        </View>
        <Text style={styles.managerCount}>{property?.managers?.length || 3} Managers (Equal Split)</Text>
      </View>

      <Text style={styles.amount}>{net === 0 ? '₹0' : formatCurrency(Math.abs(net))}</Text>
      <Text style={styles.sub}>{subText}</Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.addBtn} onPress={onAddExpense} activeOpacity={0.8}>
          <Ionicons name="add-circle" size={18} color={colors.white} />
          <Text style={styles.btnText}>Log Expense</Text>
        </TouchableOpacity>

        {owes && (
          <TouchableOpacity style={styles.settleBtn} onPress={onSettleUp} activeOpacity={0.8}>
            <Ionicons name="checkmark-done" size={17} color={colors.white} />
            <Text style={styles.btnText}>Settle Dues</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
