import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBalanceCardStyles } from './BalanceCard.styles';
import { useTheme } from '../../../context/ThemeContext';
import { formatCurrency } from '../../../utils/currency';
import PropertyManagersModal from '../../property/PropertyManagersModal/PropertyManagersModal';
import OweItem from '../WhoOwesWho/OweItem';

function BalanceCard({
  property,
  balanceData,
  expenses = [],
  userMap = {},
  currentUser,
  onSettleWithUser,
}) {
  const { colors: tColors, isDark } = useTheme();
  const styles = useMemo(() => createBalanceCardStyles(tColors, isDark), [tColors, isDark]);
  const [showManagersModal, setShowManagersModal] = useState(false);

  // 1. Total Group Spend calculation
  const totalSpent = useMemo(() => {
    if (typeof balanceData?.totalExpenses === 'number' && balanceData.totalExpenses >= 0) {
      return balanceData.totalExpenses;
    }
    return (expenses || [])
      .filter((e) => !e.isDeleted && !e.deleted && e.deleted !== 'Y' && e.isDeleted !== 'Y')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [balanceData?.totalExpenses, expenses]);

  // 2. Personal Net Balance calculation
  const net = balanceData?.currentUserNet || 0;
  const isOwed = net > 0;
  const owes = net < 0;

  const statusTitle = isOwed ? 'YOU ARE OWED' : owes ? 'YOU OWE' : 'ALL SETTLED UP';
  const badgeColor = isOwed ? tColors.success : owes ? tColors.tertiary : tColors.primary;
  const badgeBg = isOwed
    ? isDark ? 'rgba(48, 209, 88, 0.14)' : 'rgba(16, 185, 129, 0.10)'
    : owes
      ? isDark ? 'rgba(255, 159, 10, 0.14)' : 'rgba(245, 158, 11, 0.10)'
      : isDark ? 'rgba(94, 92, 230, 0.14)' : 'rgba(94, 92, 230, 0.08)';
  const badgeBorder = isOwed
    ? isDark ? 'rgba(48, 209, 88, 0.35)' : 'rgba(16, 185, 129, 0.25)'
    : owes
      ? isDark ? 'rgba(255, 159, 10, 0.35)' : 'rgba(245, 158, 11, 0.25)'
      : isDark ? 'rgba(94, 92, 230, 0.35)' : 'rgba(94, 92, 230, 0.20)';

  const subText = isOwed
    ? 'Group members owe you for logged expenses'
    : owes
      ? 'Pending reimbursement to group members'
      : 'All balances in this group are settled';

  // 3. Member balances breakdown
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

  // Group into pairs for 2-column grid. If odd count (1, 3, 5), last row has 1 item centered horizontally.
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

  return (
    <>
      <View style={styles.card}>
        {/* 1. Hero: Total Group Spend & Split Rule */}
        <View style={styles.topRow}>
          <View style={styles.spendBox}>
            <View style={styles.spendHeader}>
              <Ionicons name="receipt-outline" size={13} color={tColors.textMuted} />
              <Text style={styles.spendTitle}>Total Spend</Text>
            </View>
            <Text style={styles.spendAmount}>
              {formatCurrency(totalSpent)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.managerCountBtn}
            onPress={() => setShowManagersModal(true)}
            activeOpacity={0.75}
          >
            <Text style={styles.managerCount} numberOfLines={1}>
              {property?.managers?.length || 2} Members
            </Text>
            <Ionicons name="information-circle-outline" size={13} color={tColors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Subtle Divider */}
        <View style={styles.divider} />

        {/* 2. Personal Position: You Owe / Are Owed */}
        <View style={styles.personalSection}>
          <View style={[styles.statusPill, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
            <View style={[styles.dot, { backgroundColor: badgeColor }]} />
            <Text style={[styles.statusText, { color: badgeColor }]} numberOfLines={1}>
              {statusTitle}
            </Text>
          </View>

          <Text style={styles.amount} numberOfLines={1}>
            {net === 0 ? '₹0' : formatCurrency(Math.abs(net))}
          </Text>
          <Text style={styles.sub}>{subText}</Text>
        </View>

        {/* 3. Member Breakdown: 2-Column Grid with Settle Up */}
        {allBalances.length > 0 ? (
          <>
            <View style={styles.divider} />

            <View style={styles.breakdownHeaderRow}>
              <View style={styles.breakdownHeaderLeft}>
                <Ionicons name="swap-horizontal" size={14} color={tColors.primary} />
                <Text style={styles.breakdownTitle}>Member Balances</Text>
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
          </>
        ) : (
          <View style={[styles.settledRow, { marginTop: 12 }]}>
            <Ionicons name="checkmark-circle" size={15} color={tColors.success} />
            <Text style={styles.settledText}>All individual member balances are fully settled</Text>
          </View>
        )}
      </View>

      <PropertyManagersModal
        visible={showManagersModal}
        onClose={() => setShowManagersModal(false)}
        property={property}
        expenses={expenses}
        userMap={userMap}
        currentUser={currentUser}
      />
    </>
  );
}

export default React.memo(BalanceCard);
