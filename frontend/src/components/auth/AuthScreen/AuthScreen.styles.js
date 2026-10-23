import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../theme/colors';

export const createAuthStyles = (tColors = colors, isDark = true) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tColors.background,
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    card: {
      backgroundColor: isDark
        ? 'rgba(28, 28, 30, 0.88)'
        : 'rgba(255, 255, 255, 0.94)',
      borderRadius: 28,
      padding: 24,
      borderWidth: 1,
      borderColor: isDark
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(0, 0, 0, 0.08)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: isDark ? 0.45 : 0.12,
      shadowRadius: 28,
      elevation: 14,
      maxWidth: 440,
      width: '100%',
      alignSelf: 'center',
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(32px) saturate(190%)',
            WebkitBackdropFilter: 'blur(32px) saturate(190%)',
          }
        : {}),
    },
    header: {
      alignItems: 'center',
      marginBottom: 20,
    },
    logo: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: tColors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      shadowColor: tColors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    title: {
      color: tColors.textDark,
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: -0.4,
    },
    sub: {
      color: tColors.textMuted,
      fontSize: 13,
      marginTop: 4,
      fontWeight: '500',
    },
    tabRow: {
      flexDirection: 'row',
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.06)',
      borderRadius: 14,
      padding: 3,
      marginBottom: 18,
    },
    tab: {
      flex: 1,
      paddingVertical: 9,
      alignItems: 'center',
      borderRadius: 11,
    },
    tabActive: {
      backgroundColor: tColors.primary,
      shadowColor: tColors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    tabText: {
      color: tColors.textMuted,
      fontSize: 13,
      fontWeight: '600',
    },
    tabTextActive: {
      color: tColors.white,
      fontWeight: '700',
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
        : 'rgba(0, 0, 0, 0.035)',
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 11,
      color: tColors.textDark,
      fontSize: 14,
      borderWidth: 1,
      borderColor: tColors.borderDark,
    },
    submitBtn: {
      backgroundColor: tColors.primary,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      marginTop: 20,
      shadowColor: tColors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    submitText: {
      color: tColors.white,
      fontSize: 15,
      fontWeight: '750',
      letterSpacing: -0.2,
    },
    inviteLinkBtn: {
      alignItems: 'center',
      marginTop: 18,
      paddingVertical: 6,
    },
    inviteLinkText: {
      color: '#0A84FF',
      fontSize: 13,
      fontWeight: '600',
    },
  });

export const styles = createAuthStyles(colors, true);
