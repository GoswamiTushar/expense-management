import { StyleSheet, Platform } from 'react-native';
import { colors, getLiquidGlass } from '../../../theme/colors';

export const createSettlementHistoryStyles = (tColors = colors, isDark = true) => {
  const glass = getLiquidGlass(isDark);

  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.76)' : 'rgba(0, 0, 0, 0.42)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 24,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
          }
        : {}),
    },
    card: {
      backgroundColor: glass.backgroundColor,
      borderRadius: 26,
      padding: 20,
      width: '100%',
      maxWidth: 520,
      maxHeight: '88%',
      borderWidth: 1,
      borderColor: glass.borderColor,
      borderTopColor: glass.borderTopColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 18 },
      shadowOpacity: isDark ? 0.52 : 0.12,
      shadowRadius: 36,
      elevation: 18,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: glass.backdropFilter,
            WebkitBackdropFilter: glass.backdropFilter,
            boxShadow: `${glass.boxShadow}, 0 24px 48px -12px rgba(0, 0, 0, ${isDark ? '0.64' : '0.14'})`,
          }
        : {}),
    },
    grabber: {
      width: 36,
      height: 5,
      borderRadius: 3,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.22)'
        : 'rgba(0, 0, 0, 0.15)',
      alignSelf: 'center',
      marginBottom: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
      flex: 1,
    },
    headerIconBox: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(94, 92, 230, 0.18)' : 'rgba(94, 92, 230, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: tColors.textDark,
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: -0.3,
    },
    subTitle: {
      color: tColors.textMuted,
      fontSize: 11,
      fontWeight: '500',
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    newSettleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(94, 92, 230, 0.2)' : 'rgba(94, 92, 230, 0.12)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(94, 92, 230, 0.35)' : 'rgba(94, 92, 230, 0.25)',
    },
    newSettleText: {
      color: tColors.primary,
      fontSize: 11.5,
      fontWeight: '700',
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
    },

    /* Scope Segments: Raised by Me | Received | Audit Trail */
    scopeRow: {
      flexDirection: 'row',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 13,
      padding: 3,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    },
    scopeTab: {
      flex: 1,
      flexDirection: 'row',
      paddingVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      gap: 6,
    },
    scopeTabActive: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.18)' : '#FFFFFF',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: 5,
      elevation: 2,
    },
    scopeTabText: {
      color: tColors.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    scopeTabTextActive: {
      color: tColors.textDark,
      fontWeight: '700',
    },
    scopeBadge: {
      backgroundColor: tColors.warning,
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: 10,
      minWidth: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scopeBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '800',
    },

    /* Secondary Status Filters: ALL | PENDING | CONFIRMED | DECLINED */
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 12,
    },
    filterPill: {
      paddingHorizontal: 10,
      paddingVertical: 4.5,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
    },
    filterPillActive: {
      backgroundColor: isDark ? 'rgba(94, 92, 230, 0.25)' : 'rgba(94, 92, 230, 0.15)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(94, 92, 230, 0.4)' : 'rgba(94, 92, 230, 0.3)',
    },
    filterPillText: {
      color: tColors.textDim,
      fontSize: 11,
      fontWeight: '600',
    },
    filterPillTextActive: {
      color: isDark ? '#FFFFFF' : tColors.primary,
      fontWeight: '700',
    },

    /* Settlement Item Cards */
    item: {
      backgroundColor: tColors.cardDark,
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: tColors.borderDark,
    },
    itemPending: {
      borderColor: isDark ? 'rgba(255, 149, 0, 0.35)' : 'rgba(255, 149, 0, 0.45)',
      backgroundColor: isDark ? 'rgba(255, 149, 0, 0.05)' : 'rgba(255, 149, 0, 0.03)',
    },
    itemCancelled: {
      opacity: 0.68,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)',
    },
    top: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    partiesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,
    },
    partyAvatar: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.07)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    partyAvatarText: {
      fontSize: 10,
      fontWeight: '700',
      color: tColors.textDark,
    },
    payer: {
      color: tColors.textDark,
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    receiver: {
      color: tColors.textDark,
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    amount: {
      color: tColors.success,
      fontSize: 15,
      fontWeight: '800',
      marginLeft: 8,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
    },
    modeWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    modeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      paddingHorizontal: 7,
      paddingVertical: 2.5,
      borderRadius: 6,
    },
    modeText: {
      color: tColors.textMuted,
      fontSize: 11,
      fontWeight: '600',
    },
    date: {
      color: tColors.textDim,
      fontSize: 11,
      fontWeight: '500',
    },
    notesWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
    },
    notes: {
      color: tColors.textMuted,
      fontSize: 11.5,
      fontStyle: 'italic',
      flex: 1,
    },

    /* Status Badges */
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 9999,
      alignSelf: 'flex-start',
    },
    statusText: {
      fontSize: 10.5,
      fontWeight: '700',
    },
    statusConfirmed: {
      backgroundColor: 'rgba(52, 199, 89, 0.15)',
    },
    statusPending: {
      backgroundColor: 'rgba(255, 149, 0, 0.15)',
    },
    statusRejected: {
      backgroundColor: 'rgba(255, 59, 48, 0.15)',
    },
    statusCancelled: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },

    /* Notice Banner for Pending Outgoing Request */
    awaitingBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: isDark ? 'rgba(255, 149, 0, 0.12)' : 'rgba(255, 149, 0, 0.08)',
      padding: 9,
      borderRadius: 10,
      marginTop: 10,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 149, 0, 0.25)' : 'rgba(255, 149, 0, 0.2)',
    },
    awaitingText: {
      flex: 1,
      fontSize: 11.5,
      color: isDark ? '#FED7AA' : '#9A3412',
      fontWeight: '500',
      lineHeight: 16,
    },
    awaitingHighlight: {
      fontWeight: '700',
      color: isDark ? '#FFEDD5' : '#7C2D12',
    },

    /* Action Buttons: Cancel, Confirm, Reject */
    cardActionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 8,
      marginTop: 10,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
    },
    cancelRequestBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 59, 48, 0.1)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 59, 48, 0.35)' : 'rgba(255, 59, 48, 0.25)',
    },
    cancelRequestText: {
      color: tColors.danger,
      fontSize: 11.5,
      fontWeight: '700',
    },
    confirmBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 13,
      paddingVertical: 6.5,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(52, 199, 89, 0.2)' : 'rgba(52, 199, 89, 0.14)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(52, 199, 89, 0.4)' : 'rgba(52, 199, 89, 0.3)',
    },
    confirmText: {
      color: tColors.success,
      fontSize: 11.5,
      fontWeight: '700',
    },
    declineBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 11,
      paddingVertical: 6.5,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(255, 59, 48, 0.12)' : 'rgba(255, 59, 48, 0.08)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 59, 48, 0.3)' : 'rgba(255, 59, 48, 0.2)',
    },
    declineText: {
      color: tColors.danger,
      fontSize: 11.5,
      fontWeight: '600',
    },

    /* Audit Log Trail */
    auditTrailContainer: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
    },
    auditTrailTitle: {
      fontSize: 10.5,
      fontWeight: '700',
      color: tColors.textDim,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    auditEntryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    auditDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: tColors.primary,
    },
    auditAction: {
      fontSize: 11,
      fontWeight: '600',
      color: tColors.textDark,
    },
    auditMeta: {
      fontSize: 10.5,
      color: tColors.textDim,
    },

    /* Empty state */
    emptyBox: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 36,
      paddingHorizontal: 16,
    },
    emptyTitle: {
      color: tColors.textDark,
      fontSize: 14,
      fontWeight: '700',
      marginTop: 10,
    },
    emptyText: {
      color: tColors.textMuted,
      textAlign: 'center',
      marginTop: 4,
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 18,
    },
  });
};

export const styles = createSettlementHistoryStyles(colors, true);
