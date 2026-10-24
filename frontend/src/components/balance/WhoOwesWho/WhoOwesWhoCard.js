import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createWhoOwesWhoStyles } from './WhoOwesWhoCard.styles';
import { useTheme } from '../../../context/ThemeContext';
import OweItem from './OweItem';

function WhoOwesWhoCard({ balanceData, onSettleWithUser, userMap = {} }) {
  const { colors: tColors, isDark } = useTheme();
  const styles = useMemo(() => createWhoOwesWhoStyles(tColors, isDark), [tColors, isDark]);

  const owes = balanceData?.peopleUserOwes || [];
  const owed = balanceData?.peopleWhoOweUser || [];

  if (owes.length === 0 && owed.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.settledBox}>
          <Ionicons name="checkmark-circle" size={24} color={tColors.success} />
          <View>
            <Text style={styles.settledTitle}>Zero Pending Dues</Text>
            <Text style={styles.settledSub}>All balances in this group are fully settled!</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Ionicons name="swap-horizontal" size={16} color={tColors.primary} />
          <Text style={styles.title}>Member Balances</Text>
        </View>
      </View>
      <View style={styles.list}>
        {owes.map((item) => (
          <OweItem
            key={item.userId}
            user={userMap[item.userId] || { name: item.userId }}
            amount={item.amount}
            isOwedByMe={true}
            onSettle={onSettleWithUser}
          />
        ))}
        {owed.map((item) => (
          <OweItem
            key={item.userId}
            user={userMap[item.userId] || { name: item.userId }}
            amount={item.amount}
            isOwedByMe={false}
            onSettle={onSettleWithUser}
          />
        ))}
      </View>
    </View>
  );
}

export default React.memo(WhoOwesWhoCard);
