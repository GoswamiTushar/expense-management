import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../theme/colors';

export const createExpenseItemStyles = (tColors = colors, isDark = true) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? '#151821' : '#FFFFFF',
      borderRadius: 18,
      padding: 14,
      marginHorizontal: 16,
      marginBottom: 9,
      borderWidth: 1,
      borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.25 : 0.03,
      shadowRadius: 8,
      elevation: 2,
      ...(Platform.OS === 'web'
        ? {
            boxShadow: isDark
              ? '0 4px 14px -2px rgba(0, 0, 0, 0.40)'
              : '0 2px 8px rgba(15, 23, 42, 0.04)',
            cursor: 'pointer',
          }
        : {}),
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 12,
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: isDark ? '#1E2332' : '#F1F5F9',
      borderWidth: 1,
      borderColor: isDark ? '#2A3246' : 'rgba(15, 23, 42, 0.06)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    info: {
      flex: 1,
    },
    title: {
      color: tColors.textDark,
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    payerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
    },
    payerText: {
      color: tColors.textMuted,
      fontSize: 11.5,
      fontWeight: '500',
    },
    payerHighlight: {
      color: isDark ? '#7E7DF8' : '#5E5CE6',
      fontWeight: '600',
    },
    subRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 3,
    },
    sub: {
      color: tColors.textDim,
      fontSize: 11,
      fontWeight: '500',
    },
    receiptIcon: {
      marginLeft: 5,
    },
    right: {
      alignItems: 'flex-end',
    },
    amount: {
      color: tColors.textDark,
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: -0.3,
    },
    pill: {
      backgroundColor: isDark
        ? 'rgba(94, 92, 230, 0.14)'
        : 'rgba(94, 92, 230, 0.08)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 9999,
      marginTop: 4,
    },
    pillText: {
      color: isDark ? '#9D9CFF' : '#5E5CE6',
      fontSize: 10.5,
      fontWeight: '600',
    },
  });

export const styles = createExpenseItemStyles(colors, true);
