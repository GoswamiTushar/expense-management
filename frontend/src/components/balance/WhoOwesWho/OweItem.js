import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createOweItemStyles } from './OweItem.styles';
import { useTheme } from '../../../context/ThemeContext';
import { formatCurrency } from '../../../utils/currency';
import Avatar from '../../common/Avatar/Avatar';

export default function OweItem({ user, amount, isOwedByMe, onSettle }) {
  const { colors: tColors, isDark } = useTheme();
  const styles = useMemo(() => createOweItemStyles(tColors, isDark), [tColors, isDark]);

  return (
    <View style={styles.card}>
      {/* Top Row: Avatar & Status Badge */}
      <View style={styles.topRow}>
        <Avatar name={user.name} initials={user.initials} color={user.color} size={32} />
        <View style={[styles.statusBadge, isOwedByMe ? styles.statusBadgeOwe : styles.statusBadgeGet]}>
          <Text style={isOwedByMe ? styles.statusTextOwe : styles.statusTextGet}>
            {isOwedByMe ? 'YOU OWE' : 'OWES YOU'}
          </Text>
        </View>
      </View>

      {/* Middle Section: Member Name & Amount */}
      <View style={styles.midSection}>
        <Text style={styles.name} numberOfLines={1} maxFontSizeMultiplier={1.25}>
          {user.name}
        </Text>
        <Text
          style={[styles.amount, { color: isOwedByMe ? tColors.tertiary : tColors.success }]}
          numberOfLines={1}
          maxFontSizeMultiplier={1.25}
        >
          {isOwedByMe ? formatCurrency(amount) : `+${formatCurrency(amount)}`}
        </Text>
      </View>

      {/* Bottom Action: Noticeable yet aesthetic Settle Up button or Pending indicator */}
      {isOwedByMe ? (
        <TouchableOpacity
          style={styles.settleBtn}
          onPress={() => onSettle && onSettle(user, amount)}
          activeOpacity={0.78}
        >
          <Ionicons name="card-outline" size={12.5} color="#FFFFFF" />
          <Text style={styles.settleBtnText}>Settle Up</Text>
          <Ionicons
            name="arrow-forward"
            size={11}
            color="rgba(255, 255, 255, 0.65)"
            style={{ marginLeft: 2 }}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.awaitingTag}>
          <Ionicons name="time-outline" size={12} color={tColors.textMuted} />
          <Text style={styles.awaitingText}>Pending payment</Text>
        </View>
      )}
    </View>
  );
}
