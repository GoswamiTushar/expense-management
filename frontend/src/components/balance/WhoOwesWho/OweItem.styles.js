import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../theme/colors';

export const createOweItemStyles = (tColors = colors, isDark = true) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? '#181B26' : '#F8FAFC',
      borderRadius: 16,
      padding: 13,
      borderWidth: 1,
      borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
      marginBottom: 9,
    },
    rowOweMe: {
      borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
    },
    rowTheyOwe: {
      borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
      flex: 1,
      marginRight: 10,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    name: {
      color: tColors.textDark,
      fontSize: 13.5,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    roleBadge: {
      backgroundColor: isDark ? '#1E2332' : 'rgba(15, 23, 42, 0.06)',
      paddingHorizontal: 6,
      paddingVertical: 1.5,
      borderRadius: 4,
    },
    roleText: {
      fontSize: 9.5,
      fontWeight: '700',
      color: tColors.textMuted,
    },
    sub: {
      color: tColors.textMuted,
      fontSize: 11,
      marginTop: 2,
      fontWeight: '500',
    },
    right: {
      alignItems: 'flex-end',
      gap: 5,
    },
    amount: {
      fontSize: 14.5,
      fontWeight: '800',
      letterSpacing: -0.3,
    },
    payBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1E2332' : '#0F172A',
      paddingHorizontal: 11,
      paddingVertical: 5,
      borderRadius: 9999,
      gap: 5,
      borderWidth: 1,
      borderColor: isDark ? '#2A3246' : 'transparent',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.25 : 0.10,
      shadowRadius: 4,
      ...(Platform.OS === 'web'
        ? {
            boxShadow: isDark
              ? '0 2px 6px rgba(0, 0, 0, 0.35)'
              : '0 2px 6px rgba(15, 23, 42, 0.10)',
            cursor: 'pointer',
          }
        : {}),
    },
    btnText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
    },
  });

export const styles = createOweItemStyles(colors, true);
