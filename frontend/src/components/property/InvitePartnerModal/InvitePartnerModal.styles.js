import { StyleSheet, Platform } from 'react-native';
import { colors, getLiquidGlass } from '../../../theme/colors';

export const createInvitePartnerStyles = (tColors = colors, isDark = true) => {
  const glass = getLiquidGlass(isDark);

  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(0,0,0,0.72)' : 'rgba(0,0,0,0.36)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }
        : {}),
    },
    card: {
      backgroundColor: glass.backgroundColor,
      borderRadius: 26,
      padding: 24,
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    title: {
      color: tColors.textDark,
      fontSize: 17.5,
      fontWeight: '750',
      letterSpacing: -0.3,
    },
    sub: {
      color: tColors.textMuted,
      fontSize: 12.5,
      marginBottom: 12,
    },
    label: {
      color: tColors.textMuted,
      fontSize: 10.5,
      fontWeight: '700',
      letterSpacing: 0.5,
      marginTop: 10,
      marginBottom: 6,
    },
    input: {
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(0, 0, 0, 0.04)',
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 11,
      color: tColors.textDark,
      fontSize: 14,
      borderWidth: 1,
      borderColor: tColors.borderDark,
    },
    genBtn: {
      backgroundColor: tColors.primary,
      paddingVertical: 13,
      borderRadius: 14,
      alignItems: 'center',
      marginTop: 16,
      shadowColor: tColors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
    },
    genText: {
      color: tColors.white,
      fontSize: 14,
      fontWeight: '750',
    },
    resultBox: {
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.04)'
        : 'rgba(0, 0, 0, 0.025)',
      borderRadius: 16,
      padding: 14,
      marginTop: 14,
      borderWidth: 1,
      borderColor: tColors.borderDark,
      gap: 10,
    },
    codePill: {
      backgroundColor: isDark
        ? 'rgba(56, 189, 248, 0.12)'
        : 'rgba(10, 132, 255, 0.10)',
      padding: 10,
      borderRadius: 12,
      alignItems: 'center',
    },
    codeText: {
      color: '#38BDF8',
      fontSize: 17,
      fontWeight: '800',
      letterSpacing: 1.5,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 4,
    },
    actionBtn: {
      flex: 1,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.05)',
      paddingVertical: 10,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: tColors.borderDark,
    },
    actionText: {
      color: tColors.textDark,
      fontSize: 12.5,
      fontWeight: '700',
    },
  });
};

export const styles = createInvitePartnerStyles(colors, true);
