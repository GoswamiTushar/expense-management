import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createExpenseItemStyles } from './ExpenseItem.styles';
import { useTheme } from '../../../context/ThemeContext';
import { getCategoryById } from '../../../theme/categories';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';

export default function ExpenseItem({ expense, userMap = {}, onPress }) {
  const { colors: tColors, isDark } = useTheme();
  const styles = useMemo(() => createExpenseItemStyles(tColors, isDark), [tColors, isDark]);

  const cat = getCategoryById(expense.category);
  const splitCount = expense.splitAmong?.length || 1;
  const share = expense.sharePerPerson || Math.round((expense.amount / splitCount) * 100) / 100;
  const hasReceipt = Boolean(expense.receiptUrl);

  if (expense.isDeleted || expense.deleted === true || expense.deleted === 'Y' || expense.isDeleted === 'Y') {
    return null;
  }

  const rawPayer =
    expense.payerName && expense.payerName !== 'Manager'
      ? expense.payerName
      : userMap[expense.paidBy]?.name || expense.payerName || 'Manager';
  const payer = rawPayer || 'Manager';

  const isPendingDelete = expense.deleteStatus === 'pending_approval';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(expense)}
      activeOpacity={0.75}
    >
      <View style={styles.left}>
        <View style={[styles.iconBox, { backgroundColor: cat.color + (isDark ? '26' : '18') }]}>
          <Ionicons name={cat.icon} size={20} color={cat.color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {expense.title}
          </Text>
          <View style={styles.payerRow}>
            <Ionicons name="person-circle-outline" size={13} color={tColors.info} />
            <Text style={styles.payerText} numberOfLines={1}>
              Logged by <Text style={styles.payerHighlight}>{payer}</Text>
            </Text>
          </View>
          <View style={styles.subRow}>
            <Text style={styles.sub} numberOfLines={1}>
              {formatDate(expense.date || expense.createdAt)} • {splitCount} managers
            </Text>
            {hasReceipt && (
              <Ionicons name="camera-outline" size={12} color={tColors.textDim} style={styles.receiptIcon} />
            )}
          </View>
          {isPendingDelete && (
            <View style={styles.deletionBadge}>
              <Ionicons name="alert-circle-outline" size={11} color={isDark ? '#FBBF24' : '#B45309'} />
              <Text style={styles.deletionBadgeText}>Delete Requested</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.amount} numberOfLines={1} maxFontSizeMultiplier={1.25}>
          {formatCurrency(expense.amount)}
        </Text>
        <View style={styles.pill}>
          <Text style={styles.pillText} numberOfLines={1} maxFontSizeMultiplier={1.2}>
            {formatCurrency(share)} / person
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
