import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './WhoOwesWhoCard.styles';
import { colors } from '../../../theme/colors';
import OweItem from './OweItem';

export default function WhoOwesWhoCard({ balanceData, onSettleWithUser, userMap = {} }) {
  const owes = balanceData?.peopleUserOwes || [];
  const owed = balanceData?.peopleWhoOweUser || [];

  if (owes.length === 0 && owed.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.settledBox}>
          <Ionicons name="checkmark-circle" size={22} color={colors.success} />
          <View>
            <Text style={styles.settledTitle}>Zero Pending Dues</Text>
            <Text style={styles.settledSub}>All balances on this property are fully settled!</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="swap-horizontal" size={16} color={colors.primary} />
        <Text style={styles.title}>Manager Balances & Settlement</Text>
      </View>
      <View style={styles.list}>
        {owes.map((item) => (
          <OweItem key={item.userId} user={userMap[item.userId] || { name: item.userId }} amount={item.amount} isOwedByMe={true} onSettle={onSettleWithUser} />
        ))}
        {owed.map((item) => (
          <OweItem key={item.userId} user={userMap[item.userId] || { name: item.userId }} amount={item.amount} isOwedByMe={false} onSettle={onSettleWithUser} />
        ))}
      </View>
    </View>
  );
}
