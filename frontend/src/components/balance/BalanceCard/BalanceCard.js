import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBalanceCardStyles } from './BalanceCard.styles';
import { useTheme } from '../../../context/ThemeContext';
import { formatCurrency } from '../../../utils/currency';
import PropertyManagersModal from '../../property/PropertyManagersModal/PropertyManagersModal';

export default function BalanceCard({
  property,
  balanceData,
  expenses = [],
  userMap = {},
  currentUser,
}) {
  const { colors: tColors, isDark } = useTheme();
  const styles = useMemo(() => createBalanceCardStyles(tColors, isDark), [tColors, isDark]);
  const [showManagersModal, setShowManagersModal] = useState(false);

  const net = balanceData?.currentUserNet || 0;
  const isOwed = net > 0;
  const owes = net < 0;

  const statusTitle = isOwed ? 'YOU ARE OWED' : owes ? 'YOU OWE' : 'ALL SETTLED UP';
  const badgeColor = isOwed ? tColors.success : owes ? tColors.tertiary : tColors.primary;
  const badgeBg = isOwed
    ? isDark ? 'rgba(48, 209, 88, 0.14)' : 'rgba(16, 185, 129, 0.10)'
    : owes
    ? isDark ? 'rgba(224, 109, 83, 0.15)' : 'rgba(224, 109, 83, 0.10)'
    : isDark ? 'rgba(94, 92, 230, 0.15)' : 'rgba(94, 92, 230, 0.08)';
  const badgeBorder = isOwed
    ? isDark ? 'rgba(48, 209, 88, 0.35)' : 'rgba(16, 185, 129, 0.25)'
    : owes
    ? isDark ? 'rgba(224, 109, 83, 0.35)' : 'rgba(224, 109, 83, 0.25)'
    : isDark ? 'rgba(94, 92, 230, 0.35)' : 'rgba(94, 92, 230, 0.20)';

  const subText = isOwed
    ? 'Co-managers owe you for logged expenses'
    : owes
    ? 'Pending reimbursement to co-managers'
    : 'Zero pending dues on this property';

  return (
    <>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={[styles.statusPill, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
            <View style={[styles.dot, { backgroundColor: badgeColor }]} />
            <Text
              style={[styles.statusText, { color: badgeColor }]}
              numberOfLines={1}
              maxFontSizeMultiplier={1.2}
            >
              {statusTitle}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.managerCountBtn}
            onPress={() => setShowManagersModal(true)}
            activeOpacity={0.75}
          >
            <Text
              style={styles.managerCount}
              numberOfLines={1}
              maxFontSizeMultiplier={1.2}
            >
              {property?.managers?.length || 2} Managers (Equal Split)
            </Text>
            <Ionicons name="information-circle-outline" size={13} color={tColors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text
          style={styles.amount}
          numberOfLines={1}
          maxFontSizeMultiplier={1.25}
        >
          {net === 0 ? '₹0' : formatCurrency(Math.abs(net))}
        </Text>
        <Text style={styles.sub} maxFontSizeMultiplier={1.3}>
          {subText}
        </Text>
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
