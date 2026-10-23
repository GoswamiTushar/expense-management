import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createSettlementsPageStyles } from './SettlementsPage.styles';
import { useTheme } from '../../../context/ThemeContext';
import { formatCurrency } from '../../../utils/currency';
import { formatDateTime } from '../../../utils/date';

const getModeIcon = (mode) => {
  const m = String(mode || '').toLowerCase();
  if (m.includes('upi')) return 'flash';
  if (m.includes('cash')) return 'cash';
  if (m.includes('bank')) return 'business';
  return 'card';
};

export default function SettlementsPage({
  settlements = [],
  currentUser,
  activeProperty,
  balanceData,
  onConfirmSettlement,
  onRejectSettlement,
  onCancelSettlement,
  onEditSettlement,
  onOpenSettleWithUser,
  refreshing = false,
  onRefresh,
  onLoadMoreSettlements,
  loadingMoreSettlements = false,
}) {
  const currentUserId = String(currentUser?._id || currentUser?.id || '');
  const [scope, setScope] = useState('RAISED'); // 'RAISED' | 'RECEIVED' | 'AUDIT'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'CONFIRMED' | 'DECLINED'
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const { colors: tColors, isDark } = useTheme();
  const styles = useMemo(() => createSettlementsPageStyles(tColors, isDark), [tColors, isDark]);

  // Counts of pending requests
  const pendingOutgoingCount = settlements.filter(
    (s) =>
      String(s.settledBy) === currentUserId &&
      String(s.status || 'pending').toLowerCase() === 'pending'
  ).length;

  const pendingIncomingCount = settlements.filter(
    (s) =>
      String(s.paidTo) === currentUserId &&
      String(s.status || 'pending').toLowerCase() === 'pending'
  ).length;

  // 1. Filter by Scope
  const scopedSettlements = settlements.filter((s) => {
    const isPayer = String(s.settledBy) === currentUserId;
    const isReceiver = String(s.paidTo) === currentUserId;
    if (scope === 'RAISED') return isPayer;
    if (scope === 'RECEIVED') return isReceiver;
    return true; // AUDIT shows everything
  });

  // 2. Filter by Status
  const filteredSettlements = scopedSettlements.filter((s) => {
    const status = String(s.status || 'pending').toLowerCase();
    if (statusFilter === 'CONFIRMED') return status === 'confirmed';
    if (statusFilter === 'PENDING') return status === 'pending';
    if (statusFilter === 'CANCELLED') return status === 'cancelled';
    if (statusFilter === 'DECLINED') return status === 'rejected';
    return true;
  });

  const handleCancel = async (settlement) => {
    const sId = settlement.id || settlement._id;
    const receiverName = settlement.paidToName || 'Partner';
    const amountStr = formatCurrency(settlement.amount);
    const confirmed =
      Platform.OS === 'web'
        ? window.confirm(
          `Cancel your pending settlement request of ${amountStr} to ${receiverName}?`
        )
        : true;

    if (!confirmed) return;

    try {
      setActionLoadingId(sId);
      if (onCancelSettlement) {
        await onCancelSettlement(sId);
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel settlement request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirm = async (settlement) => {
    const sId = settlement.id || settlement._id;
    try {
      setActionLoadingId(sId);
      if (onConfirmSettlement) {
        await onConfirmSettlement(sId);
      }
    } catch (err) {
      alert(err.message || 'Failed to confirm settlement.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDecline = async (settlement) => {
    const sId = settlement.id || settlement._id;
    let reason = 'Payment not received';
    if (Platform.OS === 'web') {
      const input = window.prompt(
        `Decline this settlement of ${formatCurrency(settlement.amount)}? Reason:`,
        'Payment not received'
      );
      if (input === null) return;
      reason = input || 'Payment not received';
    }

    try {
      setActionLoadingId(sId);
      if (onRejectSettlement) {
        await onRejectSettlement(sId, reason);
      }
    } catch (err) {
      alert(err.message || 'Failed to decline settlement.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderStatusBadge = (status) => {
    const s = String(status || 'pending').toLowerCase();
    if (s === 'confirmed') {
      return (
        <View style={[styles.statusBadge, styles.statusConfirmed]}>
          <Ionicons name="lock-closed" size={10} color={tColors.success} />
          <Text style={[styles.statusText, { color: tColors.success }]}>Settled (Locked)</Text>
        </View>
      );
    }
    if (s === 'cancelled') {
      return (
        <View style={[styles.statusBadge, styles.statusCancelled]}>
          <Ionicons name="ban-outline" size={10} color={tColors.textDim} />
          <Text style={[styles.statusText, { color: tColors.textDim }]}>Cancelled</Text>
        </View>
      );
    }
    if (s === 'rejected') {
      return (
        <View style={[styles.statusBadge, styles.statusRejected]}>
          <Ionicons name="close-circle" size={10} color={tColors.danger} />
          <Text style={[styles.statusText, { color: tColors.danger }]}>Declined</Text>
        </View>
      );
    }
    return (
      <View style={[styles.statusBadge, styles.statusPending]}>
        <Ionicons name="time" size={10} color={tColors.warning} />
        <Text style={[styles.statusText, { color: tColors.warning }]}>Pending</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          // Facebook-style infinite scroll: auto load next batch seamlessly near end
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 180) {
            if (onLoadMoreSettlements) {
              onLoadMoreSettlements();
            }
          }
        }}
        scrollEventThrottle={32}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={tColors.primary}
            />
          ) : undefined
        }
      >
        {/* Scope Segments: Raised by Me | Received | Audit Trail */}
        <View style={styles.scopeRow}>
          {/* Raised by Me */}
          <TouchableOpacity
            style={[styles.scopeTab, scope === 'RAISED' && styles.scopeTabActive]}
            onPress={() => setScope('RAISED')}
            activeOpacity={0.75}
          >
            <Ionicons
              name="arrow-up-circle-outline"
              size={15}
              color={scope === 'RAISED' ? tColors.textDark : tColors.textMuted}
            />
            <Text
              style={[styles.scopeTabText, scope === 'RAISED' && styles.scopeTabTextActive]}
              numberOfLines={1}
              maxFontSizeMultiplier={1.15}
            >
              Raised by Me
            </Text>
            {pendingOutgoingCount > 0 && (
              <View style={styles.scopeBadge}>
                <Text style={styles.scopeBadgeText} maxFontSizeMultiplier={1.15}>{pendingOutgoingCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Received */}
          <TouchableOpacity
            style={[styles.scopeTab, scope === 'RECEIVED' && styles.scopeTabActive]}
            onPress={() => setScope('RECEIVED')}
            activeOpacity={0.75}
          >
            <Ionicons
              name="arrow-down-circle-outline"
              size={15}
              color={scope === 'RECEIVED' ? tColors.textDark : tColors.textMuted}
            />
            <Text
              style={[styles.scopeTabText, scope === 'RECEIVED' && styles.scopeTabTextActive]}
              numberOfLines={1}
              maxFontSizeMultiplier={1.15}
            >
              Received
            </Text>
            {pendingIncomingCount > 0 && (
              <View style={styles.scopeBadge}>
                <Text style={styles.scopeBadgeText} maxFontSizeMultiplier={1.15}>{pendingIncomingCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Audit Trail */}
          <TouchableOpacity
            style={[styles.scopeTab, scope === 'AUDIT' && styles.scopeTabActive]}
            onPress={() => setScope('AUDIT')}
            activeOpacity={0.75}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={15}
              color={scope === 'AUDIT' ? tColors.textDark : tColors.textMuted}
            />
            <Text
              style={[styles.scopeTabText, scope === 'AUDIT' && styles.scopeTabTextActive]}
              numberOfLines={1}
              maxFontSizeMultiplier={1.15}
            >
              Audit Trail
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sub-filter Pills: ALL | PENDING | CONFIRMED | CANCELLED | DECLINED */}
        <View style={styles.filterRow}>
          {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'DECLINED'].map((tab) => {
            const isActive = statusFilter === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setStatusFilter(tab)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {tab === 'ALL'
                    ? `All (${scopedSettlements.length})`
                    : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Scrollable Settlement Cards */}
        {filteredSettlements.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons
              name={
                scope === 'RAISED'
                  ? 'paper-plane-outline'
                  : scope === 'RECEIVED'
                    ? 'mail-unread-outline'
                    : 'shield-outline'
              }
              size={42}
              color={tColors.textDim}
            />
            <Text style={styles.emptyTitle}>
              {scope === 'RAISED'
                ? 'No Outgoing Settlements'
                : scope === 'RECEIVED'
                  ? 'No Received Requests'
                  : 'No Settlements Recorded Yet'}
            </Text>
            <Text style={styles.emptyText}>
              {scope === 'RAISED'
                ? 'When you record a payment to a co-manager, your pending and settled requests will appear here.'
                : scope === 'RECEIVED'
                  ? 'When a co-manager pays you, their requests will appear here for your confirmation.'
                  : 'The complete audit trail of property settlements will be tracked here.'}
            </Text>
          </View>
        ) : (
          filteredSettlements.map((s) => {
            const sId = s.id || s._id;
            const modeIcon = getModeIcon(s.paymentMode);
            const displayDate = s.createdAt || s.settledAt;
            const statusLower = String(s.status || 'pending').toLowerCase();
            const isPending = statusLower === 'pending';
            const isConfirmed = statusLower === 'confirmed';
            const isCancelled =
              statusLower === 'cancelled' || statusLower === 'rejected' || statusLower === 'declined';
            const isOutgoing = String(s.settledBy) === currentUserId;
            const isIncoming = String(s.paidTo) === currentUserId;
            const isLoading = actionLoadingId === sId;

            // Status colors: cancelled = red, confirmed = green, pending = yellow
            const amountColor = isCancelled
              ? (isDark ? '#FF453A' : '#DC2626')
              : isConfirmed
                ? (isDark ? '#30D158' : '#16A34A')
                : (isDark ? '#FF9F0A' : '#D97706');

            const payerInitial = (s.settledByName || 'P').charAt(0).toUpperCase();
            const receiverInitial = (s.paidToName || 'P').charAt(0).toUpperCase();

            return (
              <View
                key={sId}
                style={[
                  styles.item,
                  isPending && styles.itemPending,
                  isCancelled && styles.itemCancelled,
                ]}
              >
                {/* Top Row: Parties + Amount */}
                <View style={styles.top}>
                  <View style={styles.partiesRow}>
                    <View style={styles.partyAvatar}>
                      <Text style={styles.partyAvatarText}>{payerInitial}</Text>
                    </View>
                    <Text style={styles.payer} numberOfLines={1}>
                      {isOutgoing ? 'You' : s.settledByName || 'Partner'}
                    </Text>

                    <Ionicons name="arrow-forward" size={11} color={tColors.textDim} />

                    <View style={styles.partyAvatar}>
                      <Text style={styles.partyAvatarText}>{receiverInitial}</Text>
                    </View>
                    <Text style={styles.receiver} numberOfLines={1}>
                      {isIncoming ? 'You' : s.paidToName || 'Partner'}
                    </Text>
                  </View>

                  <Text style={[styles.amount, { color: amountColor }]}>
                    {formatCurrency(s.amount)}
                  </Text>
                </View>

                {/* Meta Row: Payment Mode + Status + Date */}
                <View style={styles.metaRow}>
                  <View style={styles.modeWrap}>
                    <View style={styles.modeBadge}>
                      <Ionicons name={modeIcon} size={11} color={tColors.primary} />
                      <Text style={styles.modeText}>{s.paymentMode || 'Cash'}</Text>
                    </View>
                    {renderStatusBadge(s.status)}
                  </View>

                  {Boolean(displayDate) && (
                    <Text style={styles.date}>{formatDateTime(displayDate)}</Text>
                  )}
                </View>

                {/* Notes / Reference */}
                {Boolean(s.notes) && (
                  <View style={styles.notesWrap}>
                    <Ionicons name="document-text-outline" size={12} color={tColors.textMuted} />
                    <Text style={styles.notes}>"{s.notes}"</Text>
                  </View>
                )}

                {/* Rejection notice */}
                {s.status === 'rejected' && Boolean(s.rejectionReason) && (
                  <View style={[styles.notesWrap, { backgroundColor: 'rgba(255, 59, 48, 0.08)' }]}>
                    <Ionicons name="alert-circle" size={12} color={tColors.danger} />
                    <Text style={[styles.notes, { color: tColors.danger }]}>
                      Declined: {s.rejectionReason}
                    </Text>
                  </View>
                )}

                {/* Confirmed & Settled Read-only Notice */}
                {s.status === 'confirmed' && (
                  <View style={styles.settledLockedBox}>
                    <Ionicons name="lock-closed" size={13} color={tColors.success} />
                    <Text style={styles.settledLockedText}>
                      Settled & Reconciled
                    </Text>
                  </View>
                )}

                {/* Cancelled Notice */}
                {s.status === 'cancelled' && (
                  <View style={styles.cancelledBox}>
                    <Ionicons name="information-circle-outline" size={13} color={tColors.textDim} />
                    <Text style={styles.cancelledText}>
                      This settlement request was cancelled. Retained in audit log for transparency.
                    </Text>
                  </View>
                )}

                {/* Pending Outgoing Notice & Cancel Action */}
                {isPending && isOutgoing && (
                  <>
                    <View style={styles.awaitingBox}>
                      <Ionicons name="hourglass-outline" size={15} color={tColors.warning} />
                      <Text style={styles.awaitingText}>
                        Awaiting confirmation from{' '}
                        <Text style={styles.awaitingHighlight}>
                          {s.paidToName || 'Partner'}
                        </Text>
                        . Your balances will adjust once confirmed.
                      </Text>
                    </View>

                    <View style={styles.cardActionRow}>
                      {onEditSettlement && (
                        <TouchableOpacity
                          style={styles.editRequestBtn}
                          onPress={() => onEditSettlement(s)}
                          disabled={isLoading}
                          activeOpacity={0.75}
                        >
                          <Ionicons name="create-outline" size={13} color={tColors.primary} />
                          <Text style={styles.editRequestText}>Edit Request</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={styles.cancelRequestBtn}
                        onPress={() => handleCancel(s)}
                        disabled={isLoading}
                        activeOpacity={0.75}
                      >
                        {isLoading ? (
                          <ActivityIndicator size="small" color={tColors.danger} />
                        ) : (
                          <>
                            <Ionicons name="close-circle-outline" size={13} color={tColors.danger} />
                            <Text style={styles.cancelRequestText}>Cancel Request</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {/* Pending Incoming Confirmation Actions */}
                {isPending && isIncoming && (
                  <View style={styles.cardActionRow}>
                    <TouchableOpacity
                      style={styles.declineBtn}
                      onPress={() => handleDecline(s)}
                      disabled={isLoading}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="close-outline" size={13} color={tColors.danger} />
                      <Text style={styles.declineText}>Decline</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.confirmBtn}
                      onPress={() => handleConfirm(s)}
                      disabled={isLoading}
                      activeOpacity={0.75}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color={tColors.success} />
                      ) : (
                        <>
                          <Ionicons name="checkmark-done" size={13} color={tColors.success} />
                          <Text style={styles.confirmText}>Confirm Receipt</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Audit Trail Timeline */}
                {(scope === 'AUDIT' || (s.auditLog && s.auditLog.length > 0)) && (
                  <View style={styles.auditTrailContainer}>
                    <Text style={styles.auditTrailTitle}>Audit Trail</Text>
                    {s.auditLog && s.auditLog.length > 0 ? (
                      s.auditLog.map((entry, idx) => (
                        <View key={idx} style={styles.auditEntryRow}>
                          <View style={styles.auditDot} />
                          <Text style={styles.auditAction}>
                            {entry.action === 'created'
                              ? `Initiated by ${entry.actorName || 'User'}`
                              : entry.action === 'confirmed'
                                ? `Confirmed by ${entry.actorName || 'Recipient'}`
                                : entry.action === 'cancelled'
                                  ? `Cancelled by ${entry.actorName || 'Payer'}`
                                  : entry.action === 'rejected'
                                    ? `Declined by ${entry.actorName || 'Recipient'}`
                                    : `${entry.action} by ${entry.actorName || 'User'}`}
                          </Text>
                          {Boolean(entry.timestamp) && (
                            <Text style={styles.auditMeta}>
                              • {formatDateTime(entry.timestamp)}
                            </Text>
                          )}
                        </View>
                      ))
                    ) : (
                      <View style={styles.auditEntryRow}>
                        <View style={styles.auditDot} />
                        <Text style={styles.auditAction}>
                          Initiated by {s.settledByName || 'User'}
                        </Text>
                        {Boolean(displayDate) && (
                          <Text style={styles.auditMeta}>• {formatDateTime(displayDate)}</Text>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}

        {loadingMoreSettlements && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingVertical: 18,
            }}
          >
            <ActivityIndicator size="small" color={tColors.primary} />
            <Text
              style={{
                fontSize: 12.5,
                fontWeight: '600',
                color: tColors.textMuted,
                letterSpacing: -0.2,
              }}
            >
              Loading more settlements...
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
