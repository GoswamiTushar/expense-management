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

  // Only the debtor (person who owes) can tap to initiate settlement
  const Component = isOwedByMe ? TouchableOpacity : View;

  return (
    <Component
      style={[styles.row, isOwedByMe ? styles.rowOweMe : styles.rowTheyOwe]}
      onPress={isOwedByMe ? () => onSettle(user, amount) : undefined}
      activeOpacity={0.85}
    >
      <View style={styles.left}>
        <Avatar name={user.name} initials={user.initials} color={user.color} size={36} />
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{user.name}</Text>
            {user.role && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user.role === 'admin' ? 'Lead' : 'Co-host'}</Text>
              </View>
            )}
          </View>
          <Text style={styles.sub} numberOfLines={1}>
            {isOwedByMe ? 'You owe • Tap to settle up' : 'Pending payment to you'}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: isOwedByMe ? tColors.tertiary : tColors.success }]}>
          {isOwedByMe ? formatCurrency(amount) : `+${formatCurrency(amount)}`}
        </Text>

        {isOwedByMe && (
          <View style={styles.payBtn}>
            <Ionicons name="card-outline" size={12} color="#FFFFFF" />
            <Text style={styles.btnText}>Settle Up</Text>
          </View>
        )}
      </View>
    </Component>
  );
}
