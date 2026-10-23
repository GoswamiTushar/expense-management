import { StyleSheet, Platform } from 'react-native';
import { colors, getLiquidGlass } from '../../../theme/colors';

export const createEditExpenseStyles = (tColors = colors, isDark = true) => {
  const glass = getLiquidGlass(isDark);

  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.72)' : 'rgba(0, 0, 0, 0.36)',
      justifyContent: 'flex-end',
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }
        : {}),
    },
    sheet: {
      backgroundColor: glass.backgroundColor,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      maxHeight: '92%',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 28,
      borderTopWidth: 1,
      borderTopColor: glass.borderTopColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: isDark ? 0.45 : 0.12,
      shadowRadius: 28,
      elevation: 16,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: glass.backdropFilter,
            WebkitBackdropFilter: glass.backdropFilter,
            boxShadow: `0 -12px 36px rgba(0, 0, 0, ${isDark ? '0.5' : '0.12'}), inset 0 1px 1px 0 ${glass.borderTopColor}`,
          }
        : {}),
    },
    dragHandle: {
      width: 40,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.25)'
        : 'rgba(0, 0, 0, 0.16)',
      alignSelf: 'center',
      marginBottom: 12,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 14,
    },
    titleBox: {
      flex: 1,
      marginRight: 10,
    },
    modalTitle: {
      color: tColors.textDark,
      fontSize: 18,
      fontWeight: '750',
      letterSpacing: -0.3,
    },
    modalSub: {
      color: tColors.textMuted,
      fontSize: 12,
      marginTop: 2,
    },
    body: {
      marginBottom: 10,
    },
    sectionLabel: {
      color: tColors.textMuted,
      fontSize: 10.5,
      fontWeight: '700',
      letterSpacing: 0.5,
      marginTop: 12,
      marginBottom: 6,
    },
    input: {
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(0, 0, 0, 0.035)',
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      color: tColors.textDark,
      fontSize: 14,
      borderWidth: 1,
      borderColor: tColors.borderDark,
    },
    disabledInputBox: {
      backgroundColor: isDark
        ? 'rgba(15, 23, 42, 0.6)'
        : 'rgba(0, 0, 0, 0.04)',
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: isDark
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.06)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    disabledInputText: {
      color: tColors.textMuted,
      fontSize: 15,
      fontWeight: '700',
    },
    lockedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
      gap: 4,
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    lockedBadgeText: {
      color: '#F59E0B',
      fontSize: 10.5,
      fontWeight: '700',
    },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(0, 0, 0, 0.035)',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: tColors.borderDark,
      paddingHorizontal: 14,
    },
    currency: {
      color: tColors.primary,
      fontSize: 20,
      fontWeight: '800',
      marginRight: 6,
    },
    amountInput: {
      flex: 1,
      color: tColors.textDark,
      fontSize: 18,
      fontWeight: '700',
      paddingVertical: 8,
    },
    metaCard: {
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.04)'
        : 'rgba(0, 0, 0, 0.025)',
      borderRadius: 14,
      padding: 12,
      marginTop: 12,
      borderWidth: 1,
      borderColor: tColors.borderDark,
      gap: 6,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    metaKey: {
      color: tColors.textMuted,
      fontSize: 11.5,
      fontWeight: '600',
    },
    metaVal: {
      color: tColors.textDark,
      fontSize: 11.5,
      fontWeight: '700',
    },
    auditSection: {
      marginTop: 18,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: tColors.borderDark,
    },
    auditHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 10,
    },
    auditTitle: {
      color: tColors.textDark,
      fontSize: 13.5,
      fontWeight: '750',
    },
    auditList: {
      maxHeight: 180,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.04)'
        : 'rgba(0, 0, 0, 0.025)',
      borderRadius: 14,
      padding: 10,
      borderWidth: 1,
      borderColor: tColors.borderDark,
    },
    auditItem: {
      paddingVertical: 7,
      borderBottomWidth: 1,
      borderBottomColor: isDark
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.05)',
    },
    auditItemTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    auditActor: {
      color: '#38BDF8',
      fontSize: 12,
      fontWeight: '700',
    },
    auditTime: {
      color: tColors.textDim,
      fontSize: 10.5,
    },
    auditAction: {
      color: tColors.textDark,
      fontSize: 11.5,
      marginTop: 2,
    },
    submitBtn: {
      backgroundColor: tColors.primary,
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
      shadowColor: tColors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 6,
    },
    submitText: {
      color: tColors.white,
      fontSize: 14.5,
      fontWeight: '750',
      letterSpacing: 0.2,
    },
  });
};

export const styles = createEditExpenseStyles(colors, true);
