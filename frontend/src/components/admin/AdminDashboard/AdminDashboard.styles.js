import { StyleSheet, Platform } from 'react-native';
import { colors, getLiquidGlass } from '../../../theme/colors';

export const createAdminDashboardStyles = (tColors = colors, isDark = true) => {
  const glass = getLiquidGlass(isDark);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tColors.bgDark,
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
    },
    header: {
      backgroundColor: glass.backgroundColor,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: glass.borderColor,
      borderTopWidth: 1,
      borderTopColor: glass.borderTopColor,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: glass.backdropFilter,
            WebkitBackdropFilter: glass.backdropFilter,
            boxShadow: glass.boxShadow,
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxSizing: 'border-box',
          }
        : {}),
    },
    headerLeft: {
      flex: 1,
      minWidth: 0,
      flexShrink: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      overflow: 'hidden',
    },
    adminBadge: {
      flexShrink: 0,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(94, 92, 230, 0.16)',
      paddingHorizontal: 8,
      paddingVertical: 3.5,
      borderRadius: 9999,
      gap: 4,
      borderWidth: 1,
      borderColor: 'rgba(94, 92, 230, 0.35)',
    },
    adminBadgeText: {
      color: tColors.primary,
      fontSize: 9.5,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    headerTitle: {
      color: tColors.textDark,
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: -0.3,
      flexShrink: 1,
    },
    headerRight: {
      flexShrink: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    logoutBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: tColors.cardDark,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: tColors.borderDark,
    },
    tabRow: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 10,
      gap: 10,
    },
    navTab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(0, 0, 0, 0.04)',
      borderRadius: 14,
      paddingVertical: 10,
      gap: 8,
      borderWidth: 1,
      borderColor: tColors.borderDark,
    },
    navTabActive: {
      backgroundColor: isDark
        ? 'rgba(94, 92, 230, 0.18)'
        : 'rgba(94, 92, 230, 0.12)',
      borderColor: tColors.primary,
      shadowColor: tColors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
    },
    navTabText: {
      color: tColors.textMuted,
      fontSize: 12.5,
      fontWeight: '600',
    },
    navTabTextActive: {
      color: tColors.primary,
      fontWeight: '700',
    },
    contentScroll: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 14,
    },
    sectionTitle: {
      color: tColors.textDark,
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: -0.3,
    },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(0, 0, 0, 0.035)',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: tColors.borderDark,
      paddingHorizontal: 12,
      height: 44,
      marginBottom: 14,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      color: tColors.textDark,
      fontSize: 13,
    },
    userCard: {
      backgroundColor: isDark
        ? 'rgba(26, 30, 42, 0.65)'
        : 'rgba(255, 255, 255, 0.90)',
      borderRadius: 18,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: tColors.borderDark,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: 10,
      elevation: 2,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }
        : {}),
    },
    userCardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    userInfoLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    userName: {
      color: tColors.textDark,
      fontSize: 14.5,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    userEmail: {
      color: tColors.textMuted,
      fontSize: 12,
      marginTop: 2,
      fontWeight: '500',
    },
    roleBadge: {
      paddingHorizontal: 7,
      paddingVertical: 2.5,
      borderRadius: 9999,
      alignSelf: 'flex-start',
      marginTop: 4,
    },
    roleAdmin: {
      backgroundColor: 'rgba(94, 92, 230, 0.16)',
    },
    roleUser: {
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.05)',
    },
    roleText: {
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    resetBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark
        ? 'rgba(255, 149, 0, 0.12)'
        : 'rgba(255, 149, 0, 0.08)',
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 9999,
      borderWidth: 1,
      borderColor: isDark
        ? 'rgba(255, 149, 0, 0.35)'
        : 'rgba(255, 149, 0, 0.25)',
      gap: 5,
    },
    resetBtnText: {
      color: tColors.warning,
      fontSize: 11.5,
      fontWeight: '700',
    },
    propsChipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 10,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: isDark
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(0, 0, 0, 0.04)',
    },
    propChip: {
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.07)'
        : 'rgba(0, 0, 0, 0.04)',
      paddingHorizontal: 9,
      paddingVertical: 3.5,
      borderRadius: 9999,
      borderWidth: 1,
      borderColor: tColors.borderDark,
    },
    propChipText: {
      color: tColors.textMuted,
      fontSize: 10.5,
      fontWeight: '600',
    },
    filterBox: {
      backgroundColor: isDark
        ? 'rgba(24, 28, 40, 0.70)'
        : 'rgba(255, 255, 255, 0.88)',
      borderRadius: 20,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: tColors.borderDark,
      gap: 14,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }
        : {}),
    },
    filterGroup: {
      gap: 6,
    },
    filterLabel: {
      color: tColors.textMuted,
      fontSize: 11.5,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    chipScroll: {
      flexDirection: 'row',
      gap: 8,
    },
    chip: {
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.07)'
        : 'rgba(0, 0, 0, 0.04)',
      borderRadius: 9999,
      paddingHorizontal: 13,
      paddingVertical: 7,
      borderWidth: 1,
      borderColor: tColors.borderDark,
    },
    chipActive: {
      backgroundColor: tColors.primary,
      borderColor: tColors.primary,
      shadowColor: tColors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 6,
    },
    chipText: {
      color: tColors.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    chipTextActive: {
      color: tColors.white,
      fontWeight: '700',
    },
    statsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: isDark
        ? 'rgba(26, 30, 42, 0.65)'
        : 'rgba(255, 255, 255, 0.88)',
      borderRadius: 18,
      padding: 13,
      borderWidth: 1,
      borderColor: tColors.borderDark,
      alignItems: 'center',
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }
        : {}),
    },
    statLabel: {
      color: tColors.textMuted,
      fontSize: 11,
      fontWeight: '600',
      marginBottom: 4,
    },
    statVal: {
      color: tColors.textDark,
      fontSize: 16.5,
      fontWeight: '800',
      letterSpacing: -0.3,
    },
    expenseCard: {
      backgroundColor: isDark
        ? 'rgba(26, 30, 42, 0.65)'
        : 'rgba(255, 255, 255, 0.90)',
      borderRadius: 18,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: tColors.borderDark,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }
        : {}),
    },
    expenseCardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 6,
    },
    expenseTitle: {
      color: tColors.textDark,
      fontSize: 14,
      fontWeight: '700',
      flex: 1,
      marginRight: 8,
      letterSpacing: -0.2,
    },
    expenseAmount: {
      color: tColors.textDark,
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: -0.3,
    },
    expensePropTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 6,
    },
    expensePropText: {
      color: tColors.primary,
      fontSize: 11,
      fontWeight: '700',
    },
    expenseMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
    },
    expensePayer: {
      color: tColors.textMuted,
      fontSize: 11.5,
      fontWeight: '500',
    },
    expenseDate: {
      color: tColors.textDim,
      fontSize: 11,
      fontWeight: '500',
    },
    splitSummary: {
      color: tColors.textDim,
      fontSize: 11,
      marginTop: 4,
      fontStyle: 'italic',
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.70)' : 'rgba(0, 0, 0, 0.35)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }
        : {}),
    },
    modalCard: {
      backgroundColor: glass.backgroundColor,
      borderRadius: 26,
      padding: 22,
      width: '100%',
      maxWidth: 440,
      borderWidth: 1,
      borderColor: glass.borderColor,
      borderTopColor: glass.borderTopColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: isDark ? 0.48 : 0.12,
      shadowRadius: 36,
      elevation: 16,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: glass.backdropFilter,
            WebkitBackdropFilter: glass.backdropFilter,
            boxShadow: `${glass.boxShadow}, 0 24px 48px -12px rgba(0, 0, 0, ${isDark ? '0.6' : '0.12'})`,
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
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    modalTitle: {
      color: tColors.textDark,
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: -0.3,
    },
    modalSub: {
      color: tColors.textMuted,
      fontSize: 13,
      marginBottom: 12,
      fontWeight: '500',
    },
    modalInput: {
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(0, 0, 0, 0.035)',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: tColors.borderDark,
      paddingHorizontal: 14,
      height: 46,
      color: tColors.textDark,
      fontSize: 14,
      marginBottom: 12,
    },
    quickGenBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      marginBottom: 16,
    },
    quickGenText: {
      color: tColors.primary,
      fontSize: 12,
      fontWeight: '700',
    },
    modalBtnRow: {
      flexDirection: 'row',
      gap: 10,
    },
    modalCancelBtn: {
      flex: 1,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.07)'
        : 'rgba(0, 0, 0, 0.04)',
      borderRadius: 14,
      paddingVertical: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: tColors.borderDark,
    },
    modalCancelText: {
      color: tColors.textMuted,
      fontSize: 13,
      fontWeight: '600',
    },
    modalSubmitBtn: {
      flex: 1.5,
      backgroundColor: tColors.primary,
      borderRadius: 14,
      paddingVertical: 12,
      alignItems: 'center',
      shadowColor: tColors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
    },
    modalSubmitText: {
      color: tColors.white,
      fontSize: 13,
      fontWeight: '700',
    },
  });
};

export const styles = createAdminDashboardStyles(colors, true);
