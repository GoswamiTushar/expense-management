import { StyleSheet, Platform } from 'react-native';
import { colors, getLiquidGlass } from '../../../theme/colors';

export const createSettleUpStyles = (tColors = colors, isDark = true) => {
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
      backgroundColor: isDark ? '#151821' : '#FFFFFF',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      maxHeight: '92%',
      paddingTop: 12,
      paddingBottom: 28,
      paddingHorizontal: 20,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: isDark ? 0.45 : 0.12,
      shadowRadius: 28,
      elevation: 16,
      ...(Platform.OS === 'web'
        ? {
            boxShadow: `0 -12px 36px rgba(0, 0, 0, ${isDark ? '0.55' : '0.12'}), inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)`,
          }
        : {}),
    },
    dragHandle: {
      width: 40,
      height: 4.5,
      borderRadius: 2.5,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.16)',
      alignSelf: 'center',
      marginBottom: 10,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    title: {
      color: tColors.textDark,
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: -0.3,
    },
    targetBox: {
      backgroundColor: isDark ? '#181B26' : '#F8FAFC',
      borderRadius: 16,
      padding: 13,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    targetLabel: {
      color: tColors.textMuted,
      fontSize: 11.5,
      fontWeight: '600',
    },
    targetName: {
      color: tColors.textDark,
      fontSize: 15,
      fontWeight: '700',
      marginTop: 2,
      letterSpacing: -0.2,
    },
    dueBadge: {
      backgroundColor: isDark
        ? 'rgba(224, 109, 83, 0.15)'
        : 'rgba(224, 109, 83, 0.10)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 9999,
      borderWidth: 1,
      borderColor: isDark
        ? 'rgba(224, 109, 83, 0.35)'
        : 'rgba(224, 109, 83, 0.25)',
    },
    dueBadgeText: {
      color: '#E06D53',
      fontSize: 12,
      fontWeight: '700',
    },
    label: {
      color: tColors.textMuted,
      fontSize: 11.5,
      fontWeight: '700',
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#0F1219' : '#F8FAFC',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
      paddingHorizontal: 14,
      height: 48,
      marginBottom: 8,
    },
    currencySign: {
      color: '#5E5CE6',
      fontSize: 20,
      fontWeight: '800',
      marginRight: 8,
    },
    amountInput: {
      flex: 1,
      color: tColors.textDark,
      fontSize: 19,
      fontWeight: '700',
    },
    helperBox: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 7,
      marginBottom: 14,
      gap: 6,
    },
    helperPartial: {
      backgroundColor: isDark
        ? 'rgba(224, 109, 83, 0.12)'
        : 'rgba(224, 109, 83, 0.08)',
      borderColor: isDark
        ? 'rgba(224, 109, 83, 0.35)'
        : 'rgba(224, 109, 83, 0.22)',
      borderWidth: 1,
    },
    helperFull: {
      backgroundColor: isDark
        ? 'rgba(48, 209, 88, 0.12)'
        : 'rgba(16, 185, 129, 0.08)',
      borderColor: isDark
        ? 'rgba(48, 209, 88, 0.35)'
        : 'rgba(16, 185, 129, 0.22)',
      borderWidth: 1,
    },
    helperOverpay: {
      backgroundColor: isDark
        ? 'rgba(94, 92, 230, 0.12)'
        : 'rgba(94, 92, 230, 0.08)',
      borderColor: isDark
        ? 'rgba(94, 92, 230, 0.35)'
        : 'rgba(94, 92, 230, 0.22)',
      borderWidth: 1,
    },
    helperText: {
      fontSize: 12,
      fontWeight: '600',
      flex: 1,
    },
    modeRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 14,
    },
    modePill: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#181B26' : '#F1F5F9',
      borderRadius: 12,
      paddingVertical: 9,
      borderWidth: 1,
      borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
      gap: 5,
    },
    modePillActive: {
      backgroundColor: '#5E5CE6',
      borderColor: '#5E5CE6',
    },
    modeText: {
      color: tColors.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    modeTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    presetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
    },
    presetChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.04)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    },
    presetChipText: {
      color: tColors.textMuted,
      fontSize: 11,
      fontWeight: '600',
    },
    noteWarningBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: isDark ? 'rgba(255, 149, 0, 0.15)' : 'rgba(255, 149, 0, 0.1)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 149, 0, 0.4)' : 'rgba(255, 149, 0, 0.3)',
      borderRadius: 10,
      padding: 9,
      marginBottom: 14,
    },
    noteWarningText: {
      flex: 1,
      color: isDark ? '#FED7AA' : '#9A3412',
      fontSize: 11.5,
      fontWeight: '500',
      lineHeight: 16,
    },
    noteWarningBtn: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: isDark ? 'rgba(255, 149, 0, 0.35)' : 'rgba(255, 149, 0, 0.25)',
    },
    noteWarningBtnText: {
      color: isDark ? '#FFFFFF' : '#7C2D12',
      fontSize: 11,
      fontWeight: '700',
    },
    noteInputWrap: {
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(0, 0, 0, 0.035)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: tColors.borderDark,
      paddingHorizontal: 14,
      paddingVertical: 8,
      height: 44,
      marginBottom: 8,
    },
    noteInput: {
      color: tColors.textDark,
      fontSize: 13,
    },
    upiPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(0, 0, 0, 0.035)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      gap: 7,
      borderWidth: 1,
      borderColor: tColors.borderDark,
    },
    upiText: {
      color: tColors.info,
      fontSize: 12,
      fontWeight: '600',
    },
    upiContainer: {
      marginBottom: 14,
      gap: 8,
    },
    secretCodeCard: {
      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.25)',
      borderRadius: 12,
      padding: 12,
      gap: 6,
    },
    secretCodeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    secretCodeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    secretCodeBadgeText: {
      color: '#F59E0B',
      fontSize: 10.5,
      fontWeight: '800',
      letterSpacing: 0.6,
    },
    secretCodeValue: {
      color: isDark ? '#FEF3C7' : '#B45309',
      fontSize: 19,
      fontWeight: '800',
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      letterSpacing: 2,
    },
    secretCodeHint: {
      color: isDark ? '#D1D5DB' : '#64748B',
      fontSize: 11,
      lineHeight: 15,
      fontWeight: '500',
    },
    btnRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 4,
    },
    cancelBtn: {
      flex: 1,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.07)'
        : 'rgba(0, 0, 0, 0.04)',
      paddingVertical: 13,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: tColors.borderDark,
    },
    cancelText: {
      color: tColors.textMuted,
      fontSize: 13,
      fontWeight: '600',
    },
    upiAppBtn: {
      flex: 1.2,
      backgroundColor: tColors.info,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 13,
      borderRadius: 14,
      gap: 6,
      shadowColor: tColors.info,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    upiAppText: {
      color: tColors.white,
      fontSize: 13,
      fontWeight: '700',
    },
    recordBtn: {
      flex: 1.5,
      backgroundColor: '#5E5CE6',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 13,
      borderRadius: 14,
      gap: 6,
      shadowColor: '#5E5CE6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 4,
      ...(Platform.OS === 'web'
        ? {
            boxShadow: '0 8px 20px rgba(94, 92, 230, 0.40)',
            cursor: 'pointer',
          }
        : {}),
    },
    recordText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '700',
    },
    safetyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 14,
    },
    safetyNotice: {
      color: tColors.textDim,
      fontSize: 11,
      textAlign: 'center',
      fontWeight: '500',
    },
  });
};

export const styles = createSettleUpStyles(colors, true);
