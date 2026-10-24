import { StyleSheet, Platform } from 'react-native';

export const createNotificationBannerStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? 'rgba(94, 92, 230, 0.12)' : 'rgba(94, 92, 230, 0.08)',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(94, 92, 230, 0.30)' : 'rgba(94, 92, 230, 0.20)',
      padding: 14,
      marginBottom: 14,
      position: 'relative',
      overflow: 'hidden',
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(94, 92, 230, 0.25)' : 'rgba(94, 92, 230, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(94, 92, 230, 0.40)' : 'rgba(94, 92, 230, 0.25)',
    },
    content: {
      flex: 1,
    },
    title: {
      color: colors.textDark,
      fontSize: 14,
      fontWeight: '750',
      letterSpacing: -0.2,
      marginBottom: 3,
    },
    description: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '500',
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 12,
    },
    dismissBtn: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 10,
      ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
    },
    dismissText: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    enableBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#5E5CE6',
      paddingHorizontal: 14,
      paddingVertical: 7.5,
      borderRadius: 10,
      shadowColor: '#5E5CE6',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
      ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
    },
    enableText: {
      color: '#FFFFFF',
      fontSize: 12.5,
      fontWeight: '700',
    },
  });
