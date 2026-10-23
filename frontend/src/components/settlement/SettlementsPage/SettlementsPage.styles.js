import { StyleSheet, Platform } from 'react-native';
import { colors, getLiquidGlass } from '../../../theme/colors';

export const createSettlementsPageStyles = (tColors = colors, isDark = true) => {
  const glass = getLiquidGlass(isDark);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 90, // Leave room for sticky bottom nav
    },

    /* Scope Segments: Raised by Me | Received | Audit Trail */
    scopeRow: {
      flexDirection: 'row',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 14,
      padding: 3,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    },
    scopeTab: {
      flex: 1,
      flexDirection: 'row',
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 11,
      gap: 6,
    },
    scopeTabActive: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.18)' : '#FFFFFF',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.35 : 0.08,
      shadowRadius: 5,
      elevation: 2,
    },
    scopeTabText: {
      color: tColors.textMuted,
      fontSize: 12.5,
      fontWeight: '600',
    },
    scopeTabTextActive: {
      color: tColors.textDark,
      fontWeight: '700',
    },
    scopeBadge: {
      backgroundColor: tColors.warning,
      paddingHorizontal: 6.5,
      paddingVertical: 1.5,
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

    /* Sub-filters */
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      marginBottom: 14,
    },
    filterPill: {
      paddingHorizontal: 12,
      paddingVertical: 5.5,
      borderRadius: 9,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
    },
    filterPillActive: {
      backgroundColor: isDark ? 'rgba(94, 92, 230, 0.25)' : 'rgba(94, 92, 230, 0.15)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(94, 92, 230, 0.4)' : 'rgba(94, 92, 230, 0.3)',
    },
    filterPillText: {
      color: tColors.textDim,
      fontSize: 11.5,
      fontWeight: '600',
    },
    filterPillTextActive: {
      color: isDark ? '#FFFFFF' : tColors.primary,
      fontWeight: '700',
    },

    /* Settlement Item Cards */
    item: {
      backgroundColor: tColors.cardDark,
      borderRadius: 18,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: tColors.borderDark,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    itemPending: {
      borderColor: isDark ? 'rgba(255, 149, 0, 0.4)' : 'rgba(255, 149, 0, 0.45)',
      backgroundColor: isDark ? 'rgba(255, 149, 0, 0.04)' : 'rgba(255, 149, 0, 0.025)',
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
      marginBottom: 8,
    },
    partiesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      flex: 1,
    },
    partyAvatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.07)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    partyAvatarText: {
      fontSize: 10.5,
      fontWeight: '700',
      color: tColors.textDark,
    },
    payer: {
      color: tColors.textDark,
      fontSize: 13.5,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    receiver: {
      color: tColors.textDark,
      fontSize: 13.5,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    amount: {
      color: tColors.success,
      fontSize: 16,
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
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    modeText: {
      color: tColors.textMuted,
      fontSize: 11,
      fontWeight: '600',
    },
    date: {
      color: tColors.textDim,
      fontSize: 11.5,
      fontWeight: '500',
    },
    notesWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 7,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
    },
    notes: {
      color: tColors.textMuted,
      fontSize: 12,
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
    settledLockedBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      backgroundColor: isDark ? 'rgba(52, 199, 89, 0.08)' : 'rgba(52, 199, 89, 0.05)',
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 10,
      marginTop: 10,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(52, 199, 89, 0.22)' : 'rgba(52, 199, 89, 0.15)',
    },
    settledLockedText: {
      flex: 1,
      fontSize: 11.5,
      color: isDark ? '#A7F3D0' : '#065F46',
      fontWeight: '500',
    },
    cancelledBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.025)',
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 10,
      marginTop: 10,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
    },
    cancelledText: {
      flex: 1,
      fontSize: 11.5,
      color: tColors.textMuted,
      fontWeight: '500',
    },

    /* Notice Banner for Pending Outgoing Request */
    awaitingBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: isDark ? 'rgba(255, 149, 0, 0.12)' : 'rgba(255, 149, 0, 0.08)',
      padding: 10,
      borderRadius: 11,
      marginTop: 10,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 149, 0, 0.25)' : 'rgba(255, 149, 0, 0.2)',
    },
    awaitingText: {
      flex: 1,
      fontSize: 12,
      color: isDark ? '#FED7AA' : '#9A3412',
      fontWeight: '500',
      lineHeight: 17,
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
      gap: 9,
      marginTop: 12,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
    },
    editRequestBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 13,
      paddingVertical: 7,
      borderRadius: 9,
      backgroundColor: isDark ? 'rgba(94, 92, 230, 0.16)' : 'rgba(94, 92, 230, 0.10)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(94, 92, 230, 0.35)' : 'rgba(94, 92, 230, 0.25)',
    },
    editRequestText: {
      color: tColors.primary,
      fontSize: 12,
      fontWeight: '700',
    },
    cancelRequestBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 13,
      paddingVertical: 7,
      borderRadius: 9,
      backgroundColor: isDark ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 59, 48, 0.1)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 59, 48, 0.35)' : 'rgba(255, 59, 48, 0.25)',
    },
    cancelRequestText: {
      color: tColors.danger,
      fontSize: 12,
      fontWeight: '700',
    },
    confirmBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 9,
      backgroundColor: isDark ? 'rgba(52, 199, 89, 0.2)' : 'rgba(52, 199, 89, 0.14)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(52, 199, 89, 0.4)' : 'rgba(52, 199, 89, 0.3)',
    },
    confirmText: {
      color: tColors.success,
      fontSize: 12,
      fontWeight: '700',
    },
    declineBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 9,
      backgroundColor: isDark ? 'rgba(255, 59, 48, 0.12)' : 'rgba(255, 59, 48, 0.08)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 59, 48, 0.3)' : 'rgba(255, 59, 48, 0.2)',
    },
    declineText: {
      color: tColors.danger,
      fontSize: 12,
      fontWeight: '600',
    },

    /* Audit Trail Timeline */
    auditTrailContainer: {
      marginTop: 10,
      paddingTop: 9,
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
      gap: 7,
      marginBottom: 4,
    },
    auditDot: {
      width: 5.5,
      height: 5.5,
      borderRadius: 3,
      backgroundColor: tColors.primary,
    },
    auditAction: {
      fontSize: 11.5,
      fontWeight: '600',
      color: tColors.textDark,
    },
    auditMeta: {
      fontSize: 11,
      color: tColors.textDim,
    },

    /* Quick header action button */
    headerSettleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(94, 92, 230, 0.22)' : 'rgba(94, 92, 230, 0.12)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(94, 92, 230, 0.4)' : 'rgba(94, 92, 230, 0.25)',
      marginRight: 6,
    },
    headerSettleText: {
      color: tColors.primary,
      fontSize: 12,
      fontWeight: '700',
    },

    /* Empty state */
    emptyBox: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
      paddingHorizontal: 20,
    },
    emptyTitle: {
      color: tColors.textDark,
      fontSize: 15,
      fontWeight: '700',
      marginTop: 12,
    },
    emptyText: {
      color: tColors.textMuted,
      textAlign: 'center',
      marginTop: 6,
      fontSize: 12.5,
      fontWeight: '500',
      lineHeight: 19,
    },
  });
};
