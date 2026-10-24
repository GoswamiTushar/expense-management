import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../theme/colors';

export const createOweItemStyles = (tColors = colors, isDark = true) =>
  StyleSheet.create({
    card: {
      backgroundColor: isDark ? '#1C202C' : '#F8FAFC',
      borderRadius: 18,
      padding: 13,
      borderWidth: 1,
      borderColor: isDark ? '#262D3D' : 'rgba(15, 23, 42, 0.07)',
      justifyContent: 'space-between',
      minHeight: 144,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.22 : 0.04,
      shadowRadius: 8,
      elevation: 2,
      ...(Platform.OS === 'web'
        ? {
            boxShadow: isDark
              ? '0 4px 14px rgba(0, 0, 0, 0.28)'
              : '0 2px 8px rgba(15, 23, 42, 0.04)',
            transition: 'transform 0.16s ease, box-shadow 0.16s ease',
          }
        : {}),
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statusBadge: {
      paddingHorizontal: 7,
      paddingVertical: 2.5,
      borderRadius: 9999,
      borderWidth: 1,
    },
    statusBadgeOwe: {
      backgroundColor: isDark ? 'rgba(255, 159, 10, 0.12)' : 'rgba(245, 158, 11, 0.10)',
      borderColor: isDark ? 'rgba(255, 159, 10, 0.28)' : 'rgba(245, 158, 11, 0.22)',
    },
    statusBadgeGet: {
      backgroundColor: isDark ? 'rgba(52, 199, 89, 0.12)' : 'rgba(16, 185, 129, 0.10)',
      borderColor: isDark ? 'rgba(52, 199, 89, 0.28)' : 'rgba(16, 185, 129, 0.22)',
    },
    statusTextOwe: {
      fontSize: 8.5,
      fontWeight: '800',
      color: isDark ? '#FFB340' : '#D97706',
      letterSpacing: 0.4,
    },
    statusTextGet: {
      fontSize: 8.5,
      fontWeight: '800',
      color: isDark ? '#34C759' : '#059669',
      letterSpacing: 0.4,
    },
    midSection: {
      marginTop: 9,
      marginBottom: 10,
    },
    name: {
      color: tColors.textDark,
      fontSize: 13.5,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    amount: {
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: -0.2,
      marginTop: 3,
      ...(Platform.OS === 'web'
        ? {
            fontFeatureSettings: '"tnum"',
            fontVariantNumeric: 'tabular-nums',
          }
        : {}),
    },
    settleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderRadius: 9999,
      backgroundColor: isDark ? '#1E2332' : '#0F172A',
      borderWidth: 1,
      borderColor: isDark ? '#2A3246' : 'rgba(15, 23, 42, 0.08)',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.35 : 0.08,
      shadowRadius: 5,
      elevation: 2,
      ...(Platform.OS === 'web'
        ? {
            boxShadow: isDark
              ? '0 2px 6px rgba(0, 0, 0, 0.35)'
              : '0 2px 6px rgba(15, 23, 42, 0.08)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }
        : {}),
    },
    settleBtnText: {
      color: '#FFFFFF',
      fontSize: 11.5,
      fontWeight: '600',
      letterSpacing: -0.1,
    },
    awaitingTag: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 6.5,
      paddingHorizontal: 10,
      borderRadius: 9999,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.04)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(15, 23, 42, 0.06)',
    },
    awaitingText: {
      color: tColors.textMuted,
      fontSize: 10.5,
      fontWeight: '500',
    },
  });

export const styles = createOweItemStyles(colors, true);
