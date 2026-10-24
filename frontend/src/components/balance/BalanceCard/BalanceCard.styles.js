import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../theme/colors';

export const createBalanceCardStyles = (tColors = colors, isDark = true) =>
  StyleSheet.create({
    card: {
      backgroundColor: isDark ? '#151821' : '#FFFFFF',
      borderRadius: 24,
      padding: 20,
      marginHorizontal: 16,
      marginTop: 14,
      borderWidth: 1,
      borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
      borderTopColor: isDark ? 'rgba(129, 140, 248, 0.28)' : 'rgba(94, 92, 230, 0.20)',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.38 : 0.06,
      shadowRadius: 24,
      elevation: 6,
      ...(Platform.OS === 'web'
        ? {
          backgroundImage: isDark
            ? 'radial-gradient(ellipse 75% 50% at 85% 0%, rgba(94, 92, 230, 0.14) 0%, rgba(147, 51, 234, 0.04) 50%, transparent 85%)'
            : 'radial-gradient(ellipse 75% 50% at 85% 0%, rgba(238, 242, 255, 0.90) 0%, transparent 70%)',
          boxShadow: isDark
            ? 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.10), 0 16px 36px -8px rgba(0, 0, 0, 0.55)'
            : 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.95), 0 10px 28px -4px rgba(15, 23, 42, 0.06)',
        }
        : {}),
    },

    // 1. Top Row: Total Group Spend & Members split info
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    spendBox: {
      flex: 1,
      marginRight: 10,
    },
    spendHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    spendTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: tColors.textMuted,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    spendAmount: {
      fontSize: 17,
      fontWeight: '600',
      color: tColors.textDark,
      letterSpacing: -0.2,
      marginTop: 2,
      ...(Platform.OS === 'web'
        ? {
          fontFeatureSettings: '"tnum"',
          fontVariantNumeric: 'tabular-nums',
        }
        : {}),
    },
    managerCountBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
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

    // Subtle Section Divider
    divider: {
      height: 1,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(15, 23, 42, 0.06)',
      marginVertical: 11,
      width: '100%',
    },

    // 2. Middle: Personal Net Position (You Owe / Are Owed)
    personalSection: {
      width: '100%',
    },
    personalBalanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: "space-between",
      gap: 10,
      flexWrap: 'wrap',
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 9,
      paddingVertical: 3.5,
      borderRadius: 9999,
      borderWidth: 1,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 5,
    },
    statusText: {
      fontSize: 10.5,
      fontWeight: '800',
      letterSpacing: 0.4,
    },
    amount: {
      color: tColors.textDark,
      fontSize: 28,
      fontWeight: '700',
      letterSpacing: -0.5,
      ...(Platform.OS === 'web'
        ? {
          fontFeatureSettings: '"tnum"',
          fontVariantNumeric: 'tabular-nums',
        }
        : {}),
    },
    sub: {
      color: tColors.textMuted,
      fontSize: 12,
      fontWeight: '500',
      marginTop: 2,
    },

    // 3. Bottom: Member Breakdown Grid
    breakdownHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 11,
    },
    breakdownHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    breakdownTitle: {
      color: tColors.textDark,
      fontSize: 13.5,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    reconBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2.5,
      borderRadius: 9999,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.05)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
    },
    reconText: {
      fontSize: 9,
      fontWeight: '800',
      color: tColors.textMuted,
      letterSpacing: 0.4,
    },
    gridContainer: {
      gap: 10,
      width: '100%',
    },
    gridRowPair: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: 10,
      width: '100%',
    },
    gridRowSingle: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'stretch',
      width: '100%',
    },
    colPair: {
      flex: 1,
    },
    colSingle: {
      width: '48.5%',
      minWidth: 155,
      maxWidth: 240,
    },
    settledRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 4,
    },
    settledText: {
      color: tColors.success,
      fontSize: 12.5,
      fontWeight: '600',
    },
  });

export const styles = createBalanceCardStyles(colors, true);
