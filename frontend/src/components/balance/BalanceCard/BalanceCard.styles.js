import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../theme/colors';

export const createBalanceCardStyles = (tColors = colors, isDark = true) =>
  StyleSheet.create({
    card: {
      backgroundColor: isDark ? '#151821' : '#FFFFFF',
      borderRadius: 24,
      padding: 22,
      marginHorizontal: 16,
      marginTop: 16,
      borderWidth: 1,
      borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
      borderTopColor: isDark ? 'rgba(129, 140, 248, 0.28)' : 'rgba(94, 92, 230, 0.20)',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.40 : 0.06,
      shadowRadius: 24,
      elevation: 6,
      ...(Platform.OS === 'web'
        ? {
            backgroundImage: isDark
              ? 'radial-gradient(ellipse 70% 60% at 85% 0%, rgba(94, 92, 230, 0.16) 0%, rgba(147, 51, 234, 0.05) 50%, transparent 85%)'
              : 'radial-gradient(ellipse 70% 60% at 85% 0%, rgba(238, 242, 255, 0.90) 0%, transparent 70%)',
            boxShadow: isDark
              ? 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.10), 0 18px 40px -8px rgba(0, 0, 0, 0.60)'
              : 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.95), 0 10px 28px -4px rgba(15, 23, 42, 0.06)',
          }
        : {}),
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 11,
      paddingVertical: 5,
      borderRadius: 9999,
      borderWidth: 1,
    },
    dot: {
      width: 6.5,
      height: 6.5,
      borderRadius: 3.5,
      marginRight: 6,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    managerCountBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 9999,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.04)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)',
      ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
    },
    managerCount: {
      color: tColors.textMuted,
      fontSize: 11.5,
      fontWeight: '600',
    },
    amount: {
      color: tColors.textDark,
      fontSize: 34,
      fontWeight: '600',
      letterSpacing: -0.5,
      marginTop: 12,
    },
    sub: {
      color: tColors.textMuted,
      fontSize: 12.5,
      fontWeight: '500',
      marginTop: 2,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 16,
    },
    addBtn: {
      flex: 1,
      backgroundColor: isDark ? '#FFFFFF' : '#0F172A',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 13,
      borderRadius: 9999,
      gap: 7,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.25 : 0.15,
      shadowRadius: 10,
      elevation: 4,
      ...(Platform.OS === 'web'
        ? {
            boxShadow: isDark
              ? '0 6px 18px rgba(0, 0, 0, 0.35)'
              : '0 6px 16px rgba(15, 23, 42, 0.18)',
            cursor: 'pointer',
          }
        : {}),
    },
    btnText: {
      color: isDark ? '#0C0E14' : '#FFFFFF',
      fontSize: 13.5,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    settleBtn: {
      flex: 1,
      backgroundColor: tColors.success,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 13,
      borderRadius: 9999,
      gap: 6,
      shadowColor: tColors.success,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 4,
    },
  });

export const styles = createBalanceCardStyles(colors, true);
