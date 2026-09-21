import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './OweItem.styles';
import { colors } from '../../../theme/colors';
import { formatCurrency } from '../../../utils/currency';
import Avatar from '../../common/Avatar/Avatar';

export default function OweItem({ user, amount, isOwedByMe, onSettle }) {
  const Component = isOwedByMe ? TouchableOpacity : View;

  return (
    <Component
      style={[styles.row, isOwedByMe && styles.rowOweMe]}
      onPress={isOwedByMe ? () => onSettle(user, amount) : undefined}
      activeOpacity={0.8}
    >
      <View style={styles.left}>
        <Avatar name={user.name} initials={user.initials} color={user.color} size={34} />
        <View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.sub}>{isOwedByMe ? 'Tap to pay via UPI' : 'Pending payment to you'}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: isOwedByMe ? colors.warning : colors.success }]}>
          {isOwedByMe ? formatCurrency(amount) : `+${formatCurrency(amount)}`}
        </Text>
        {isOwedByMe && (
          <View style={styles.payBtn}>
            <Ionicons name="flash" size={11} color={colors.white} />
            <Text style={styles.btnText}>Pay via UPI</Text>
          </View>
        )}
      </View>
    </Component>
  );
}
