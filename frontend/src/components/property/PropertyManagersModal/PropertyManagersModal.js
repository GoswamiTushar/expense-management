import React, { useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createPropertyManagersStyles } from './PropertyManagersModal.styles';
import { useTheme } from '../../../context/ThemeContext';
import { formatCurrency } from '../../../utils/currency';

export default function PropertyManagersModal({
  visible,
  onClose,
  property,
  expenses = [],
  userMap = {},
  currentUser,
}) {
  const { colors: tColors, isDark } = useTheme();
  const styles = useMemo(() => createPropertyManagersStyles(tColors, isDark), [tColors, isDark]);

  // Scalable, memoized calculation of total investments & percentages
  const managerStats = useMemo(() => {
    if (!property) return { totalInvested: 0, fairShare: 0, managers: [] };

    const managersList =
      property.managerDetails ||
      property.managers?.map((id) => userMap[id] || { id, name: id }) ||
      [];

    const activeExpenses = expenses.filter(
      (e) => !e.isDeleted && !e.deleted && e.deleted !== 'Y' && e.isDeleted !== 'Y'
    );
    const totalInvested = activeExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const count = managersList.length || 1;
    const fairShare = totalInvested / count;

    const list = managersList.map((m) => {
      const mId = String(m.id || m._id || m);
      const paid = activeExpenses
        .filter((e) => String(e.paidBy) === mId)
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      const pctNum = totalInvested > 0 ? (paid / totalInvested) * 100 : 0;
      const pctStr = pctNum.toFixed(1);
      const diff = paid - fairShare;

      const userObj = userMap[mId] || m;
      const name = userObj.name || m.name || 'Co-Manager';
      const phone = userObj.phone || m.phone || userObj.email || m.email || 'N/A';
      const isCurrent = currentUser && (currentUser._id === mId || currentUser.id === mId);

      return {
        id: mId,
        name,
        phone,
        paid,
        pctNum,
        pctStr,
        diff,
        isCurrent,
      };
    });

    // Sort by paid amount descending
    list.sort((a, b) => b.paid - a.paid);

    return { totalInvested, fairShare, managers: list };
  }, [property, expenses, userMap, currentUser]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.dragPill} />

          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Property Co-Managers</Text>
              <Text style={styles.sub}>
                {property?.name || 'Property'} • {managerStats.managers.length} Managers (Equal Split)
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={18} color={tColors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Investment Benchmark Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryTopRow}>
              <Text style={styles.summaryLabel}>Total Capital Invested</Text>
              <Text style={styles.summaryTotal}>₹{formatCurrency(managerStats.totalInvested)}</Text>
            </View>
            <Text style={styles.benchmarkText}>
              Equal benchmark: ₹{formatCurrency(managerStats.fairShare)} per manager (
              {(100 / (managerStats.managers.length || 1)).toFixed(1)}%)
            </Text>
          </View>

          <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
            {managerStats.managers.map((m) => {
              const initials = m.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <View key={m.id} style={styles.managerCard}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{initials}</Text>
                    </View>

                    <View style={styles.infoCol}>
                      <View style={styles.nameRow}>
                        <Text style={styles.managerName} numberOfLines={1}>
                          {m.name}
                        </Text>
                        {m.isCurrent && (
                          <View style={styles.youBadge}>
                            <Text style={styles.youBadgeText}>YOU</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.contactText} numberOfLines={1}>
                        {m.phone}
                      </Text>
                    </View>

                    <View style={styles.pctCol}>
                      <Text style={styles.pctValue}>{m.pctStr}%</Text>
                      <Text style={styles.pctLabel}>Share</Text>
                    </View>
                  </View>

                  {/* Visual percentage progress bar */}
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(m.pctNum, 100)}%`,
                          backgroundColor:
                            m.diff > 0
                              ? tColors.success
                              : m.diff < 0
                              ? tColors.tertiary
                              : tColors.primary,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.cardBottomRow}>
                    <Text style={styles.investedAmountText}>
                      ₹{formatCurrency(m.paid)} invested
                    </Text>
                    <Text
                      style={[
                        styles.statusBadgeText,
                        {
                          color:
                            m.diff > 1
                              ? tColors.success
                              : m.diff < -1
                              ? tColors.tertiary
                              : tColors.primary,
                        },
                      ]}
                    >
                      {m.diff > 1
                        ? `+₹${formatCurrency(m.diff)} above benchmark`
                        : m.diff < -1
                        ? `-₹${formatCurrency(Math.abs(m.diff))} below benchmark`
                        : 'On benchmark'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
