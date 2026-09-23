import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './ExpenseItem.styles';
import { getCategoryById } from '../../../theme/categories';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';

export default function ExpenseItem({ expense, userMap = {}, onPress }) {
  const cat = getCategoryById(expense.category);
  const splitCount = expense.splitAmong?.length || 1;
  const share = expense.sharePerPerson || Math.round((expense.amount / splitCount) * 100) / 100;
  const hasReceipt = Boolean(expense.receiptUrl);

  const rawPayer =
    expense.payerName && expense.payerName !== 'Manager'
      ? expense.payerName
      : userMap[expense.paidBy]?.name || expense.payerName || 'Manager';
  const payer = rawPayer || 'Manager';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(expense)}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <View style={[styles.iconBox, { backgroundColor: cat.color + '22' }]}>
          <Ionicons name={cat.icon} size={18} color={cat.color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {expense.title}
          </Text>
          <View style={styles.payerRow}>
            <Ionicons name="person-circle-outline" size={13} color="#38BDF8" />
            <Text style={styles.payerText} numberOfLines={1}>
              Logged by <Text style={styles.payerHighlight}>{payer}</Text>
            </Text>
          </View>
          <Text style={styles.sub} numberOfLines={1}>
            {formatDate(expense.date || expense.createdAt)} • {splitCount} managers
            {hasReceipt ? ' 📷' : ''}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>{formatCurrency(share)} / person</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
