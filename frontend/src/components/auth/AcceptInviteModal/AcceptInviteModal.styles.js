import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../theme/colors';

export const createAcceptInviteStyles = (tColors = colors, isDark = true) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(0,0,0,0.70)' : 'rgba(0,0,0,0.35)',
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
    card: {
      backgroundColor: isDark
        ? 'rgba(28, 28, 30, 0.90)'
        : 'rgba(255, 255, 255, 0.95)',
      borderRadius: 24,
      padding: 22,
      width: '100%',
      maxWidth: 440,
      borderWidth: 1,
      borderColor: isDark
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(0, 0, 0, 0.08)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.45 : 0.12,
      shadowRadius: 24,
      elevation: 12,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(32px) saturate(190%)',
            WebkitBackdropFilter: 'blur(32px) saturate(190%)',
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
    joinBtn: {
      backgroundColor: tColors.success,
      paddingVertical: 13,
      borderRadius: 14,
      alignItems: 'center',
      marginTop: 18,
      shadowColor: tColors.success,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
    },
    btnText: {
      color: tColors.white,
      fontSize: 14.5,
      fontWeight: '750',
    },
  });

export const styles = createAcceptInviteStyles(colors, true);
