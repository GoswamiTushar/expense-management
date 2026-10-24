import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createWhoOwesWhoStyles } from './WhoOwesWhoCard.styles';
import { useTheme } from '../../../context/ThemeContext';
import OweItem from './OweItem';

function WhoOwesWhoCard({ balanceData, onSettleWithUser, userMap = {} }) {
  const { colors: tColors, isDark } = useTheme();
  const styles = useMemo(() => createWhoOwesWhoStyles(tColors, isDark), [tColors, isDark]);

  const allBalances = useMemo(() => {
    const list = [];
    (balanceData?.peopleUserOwes || []).forEach((item) => {
      list.push({ ...item, isOwedByMe: true });
    });
    (balanceData?.peopleWhoOweUser || []).forEach((item) => {
      list.push({ ...item, isOwedByMe: false });
    });
    return list;
  }, [balanceData?.peopleUserOwes, balanceData?.peopleWhoOweUser]);

  // Group into pairs for 2x2 grid. If odd count (1, 3, 5), the last row has 1 item centered horizontally.
  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < allBalances.length; i += 2) {
      if (i + 1 < allBalances.length) {
        result.push({ isPair: true, items: [allBalances[i], allBalances[i + 1]] });
      } else {
        result.push({ isPair: false, items: [allBalances[i]] });
      }
    }
    return result;
  }, [allBalances]);

  if (allBalances.length === 0) {
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
        <View style={styles.reconBadge}>
          <Text style={styles.reconText}>{allBalances.length} {allBalances.length === 1 ? 'MEMBER' : 'MEMBERS'}</Text>
        </View>
      </View>
      <View style={styles.gridContainer}>
        {rows.map((row, rIdx) => (
          <View key={`row-${rIdx}`} style={row.isPair ? styles.gridRowPair : styles.gridRowSingle}>
            {row.items.map((item) => (
              <View key={item.userId} style={row.isPair ? styles.colPair : styles.colSingle}>
                <OweItem
                  user={userMap[item.userId] || { name: item.userId }}
                  amount={item.amount}
                  isOwedByMe={item.isOwedByMe}
                  onSettle={onSettleWithUser}
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

export default React.memo(WhoOwesWhoCard);
