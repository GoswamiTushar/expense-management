import { StyleSheet, Platform } from 'react-native';
import { colors, getLiquidGlass } from '../../../theme/colors';

export const createForgotPasswordStyles = (tColors = colors, isDark = true) => {
  const glass = getLiquidGlass(isDark);

  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(0,0,0,0.72)' : 'rgba(0,0,0,0.38)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }
        : {}),
    },
    card: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: glass.backgroundColor,
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: glass.borderColor,
      borderTopColor: glass.borderTopColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: isDark ? 0.45 : 0.12,
      shadowRadius: 32,
      elevation: 16,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: glass.backdropFilter,
            WebkitBackdropFilter: glass.backdropFilter,
            boxShadow: `${glass.boxShadow}, 0 20px 40px -10px rgba(0, 0, 0, ${isDark ? '0.6' : '0.12'})`,
          }
        : {}),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    titleGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    iconBubble: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(244, 63, 94, 0.15)' : 'rgba(244, 63, 94, 0.10)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(244, 63, 94, 0.3)' : 'rgba(244, 63, 94, 0.2)',
    },
    title: {
      color: tColors.textDark,
      fontSize: 18,
      fontWeight: '750',
      letterSpacing: -0.3,
    },
    sub: {
      color: tColors.textMuted,
      fontSize: 13,
      marginTop: 6,
      lineHeight: 18,
    },
    emailHighlight: {
      color: tColors.primary,
      fontWeight: '700',
    },
    label: {
      color: tColors.textDim,
      fontSize: 11,
      fontWeight: '750',
      marginTop: 16,
      marginBottom: 6,
      letterSpacing: 0.5,
    },
    input: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 12,
      color: tColors.textDark,
      fontSize: 15,
      borderWidth: 1,
      borderColor: tColors.borderDark,
    },
    otpInput: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: tColors.textDark,
      fontSize: 24,
      fontWeight: '800',
      letterSpacing: 8,
      textAlign: 'center',
      borderWidth: 1,
      borderColor: tColors.borderDark,
    },
    errorBox: {
      marginTop: 10,
      padding: 10,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
    },
    errorText: {
      color: '#EF4444',
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
    },
    stepIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 14,
      marginBottom: 6,
    },
    stepDot: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    },
    stepDotActive: {
      backgroundColor: tColors.primary,
    },
    actionBtn: {
      backgroundColor: tColors.primary,
      paddingVertical: 13,
      borderRadius: 14,
      alignItems: 'center',
      marginTop: 18,
      shadowColor: tColors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
    },
    actionBtnText: {
      color: tColors.white,
      fontSize: 14.5,
      fontWeight: '750',
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 14,
      gap: 4,
    },
    footerText: {
      color: tColors.textMuted,
      fontSize: 12,
    },
    footerLink: {
      color: tColors.primary,
      fontSize: 12,
      fontWeight: '700',
    },
  });
};

export const styles = createForgotPasswordStyles(colors, true);
