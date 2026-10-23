import React, { useState, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createPendingSettlementsStyles } from './PendingSettlementsCard.styles';
import { useTheme } from '../../../context/ThemeContext';
import { formatCurrency } from '../../../utils/currency';

const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getModeIcon = (mode) => {
  const m = String(mode || '').toLowerCase();
  if (m.includes('upi') || m.includes('gpay') || m.includes('phonepe') || m.includes('paytm')) {
    return 'flash';
  }
  if (m.includes('cash')) {
    return 'cash-outline';
  }
  if (m.includes('bank') || m.includes('transfer') || m.includes('neft') || m.includes('rtgs')) {
    return 'business-outline';
  }
  return 'card-outline';
};

export default function PendingSettlementsCard({
  pendingIncoming = [],
  pendingOutgoing = [],
  onConfirm,
  onReject,
  onCancel,
  onEdit,
  onOpenHistory,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const [loadingId, setLoadingId] = useState(null);
  const { colors: tColors, isDark } = useTheme();
  const styles = useMemo(() => createPendingSettlementsStyles(tColors, isDark), [tColors, isDark]);

  const toggleAccordion = () => {
    if (isExpanded) {
      setIsExpanded(false);
      Animated.timing(anim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) setIsRendered(false);
      });
    } else {
      setIsRendered(true);
      setIsExpanded(true);
      Animated.timing(anim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: false,
      }).start();
    }
  };

  const totalIncomingAmount = useMemo(() => {
    return pendingIncoming.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  }, [pendingIncoming]);

  if (pendingIncoming.length === 0 && pendingOutgoing.length === 0) {
    return null;
  }

  const handleConfirm = async (settlementId) => {
    setLoadingId(settlementId);
    try {
      await onConfirm(settlementId);
    } catch (err) {
      alert(err.message || 'Failed to confirm settlement.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDecline = (settlementId, payerName) => {
    if (Platform.OS === 'web') {
      const reason = window.prompt(
        `Decline settlement from ${payerName}? Enter reason (optional):`,
        'Payment not received'
      );
      if (reason !== null) {
        setLoadingId(settlementId);
        onReject(settlementId, reason || 'Payment not received')
          .catch((err) => alert(err.message || 'Failed to decline settlement.'))
          .finally(() => setLoadingId(null));
      }
    } else {
      Alert.alert(
        'Decline Settlement',
        `Are you sure you want to decline this settlement from ${payerName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Decline',
            style: 'destructive',
            onPress: () => {
              setLoadingId(settlementId);
              onReject(settlementId, 'Payment not received')
                .catch((err) => alert(err.message || 'Failed to decline settlement.'))
                .finally(() => setLoadingId(null));
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Incoming Settlements requiring user's confirmation */}
      {pendingIncoming.length > 0 && (
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.header}
            onPress={toggleAccordion}
            activeOpacity={0.7}
          >
            <View style={styles.headerLeft}>
              <View style={styles.bellWrap}>
                <Ionicons name="notifications" size={14} color={tColors.warning} />
              </View>
              <Text
                style={styles.title}
                numberOfLines={1}
                maxFontSizeMultiplier={1.2}
              >
                Payment Confirmation Needed
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingIncoming.length}</Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <Text style={styles.collapsedAmount}>{formatCurrency(totalIncomingAmount)}</Text>
              <View style={styles.chevronBtn}>
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '180deg'],
                        }),
                      },
                    ],
                  }}
                >
                  <Ionicons
                    name="chevron-down"
                    size={14}
                    color={tColors.textMuted}
                  />
                </Animated.View>
              </View>
            </View>
          </TouchableOpacity>

          {isRendered && (
            <Animated.View
              style={[
                styles.itemsContainer,
                {
                  maxHeight: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1200],
                  }),
                  opacity: anim.interpolate({
                    inputRange: [0, 0.25, 1],
                    outputRange: [0, 0.4, 1],
                  }),
                  overflow: 'hidden',
                },
              ]}
            >
              {pendingIncoming.map((s, idx) => {
                const sId = s.id || s._id;
                const isLoading = loadingId === sId;
                const payerName = s.settledByName || 'Partner';
                const initials = getInitials(payerName);
                const modeIcon = getModeIcon(s.paymentMode);
                const isLast = idx === pendingIncoming.length - 1;

                return (
                  <View key={sId} style={[styles.item, isLast && { marginBottom: 0 }]}>
                    <View style={styles.itemHeader}>
                      <View style={styles.payerBox}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.payerName} numberOfLines={1}>
                            {payerName}
                          </Text>
                          <View style={styles.modeBadge}>
                            <Ionicons name={modeIcon} size={11} color={tColors.textMuted} />
                            <Text style={styles.modeText}>{s.paymentMode || 'Cash'}</Text>
                          </View>
                        </View>
                      </View>
                      <Text style={styles.amountText}>{formatCurrency(s.amount)}</Text>
                    </View>

                    {Boolean(s.notes) && (
                      <View style={styles.notesBox}>
                        <Ionicons
                          name="chatbubble-ellipses-outline"
                          size={11}
                          color={tColors.textMuted}
                        />
                        <Text style={styles.notesText} numberOfLines={2}>
                          "{s.notes}"
                        </Text>
                      </View>
                    )}

                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.declineBtn}
                        onPress={() => handleDecline(sId, payerName)}
                        disabled={isLoading}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.declineText}>Decline</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.confirmBtn, isLoading && { opacity: 0.8 }]}
                        onPress={() => handleConfirm(sId)}
                        disabled={isLoading}
                        activeOpacity={0.8}
                      >
                        {isLoading ? (
                          <ActivityIndicator size="small" color={tColors.success} />
                        ) : (
                          <>
                            <Ionicons name="checkmark-circle" size={14} color={tColors.success} />
                            <Text style={styles.confirmText}>Confirm Receipt</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </Animated.View>
          )}
        </View>
      )}

      {/* 2. Outgoing Settlements awaiting confirmation from recipient */}
      {pendingOutgoing.map((s) => {
        const sId = s.id || s._id;
        return (
          <TouchableOpacity
            key={sId}
            style={[
              styles.outgoingBanner,
              pendingIncoming.length > 0 && { marginTop: 10 },
            ]}
            onPress={onOpenHistory}
            activeOpacity={onOpenHistory ? 0.85 : 1}
          >
            <Ionicons name="time" size={15} color={tColors.warning} />
            <Text style={styles.outgoingText}>
              You recorded <Text style={styles.highlight}>{formatCurrency(s.amount)}</Text> (
              {s.paymentMode || 'Cash'}) to{' '}
              <Text style={styles.highlight}>{s.paidToName || 'Partner'}</Text>. Awaiting their
              confirmation.
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {onEdit && (
                <TouchableOpacity
                  style={styles.editOutgoingBtn}
                  onPress={(e) => {
                    e?.stopPropagation?.();
                    onEdit(s);
                  }}
                  activeOpacity={0.75}
                >
                  <Ionicons name="pencil-outline" size={12} color={isDark ? '#A5B4FC' : '#4F46E5'} />
                  <Text style={styles.editOutgoingText}>Edit</Text>
                </TouchableOpacity>
              )}
              {onCancel && (
                <TouchableOpacity
                  style={styles.cancelOutgoingBtn}
                  onPress={(e) => {
                    e?.stopPropagation?.();
                    const conf =
                      Platform.OS === 'web'
                        ? window.confirm(
                          `Cancel this pending settlement request of ${formatCurrency(
                            s.amount
                          )} to ${s.paidToName || 'Partner'}?`
                        )
                        : true;
                    if (conf) onCancel(sId);
                  }}
                  activeOpacity={0.75}
                >
                  <Ionicons name="close-circle-outline" size={13} color={tColors.danger} />
                  <Text style={styles.cancelOutgoingText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
