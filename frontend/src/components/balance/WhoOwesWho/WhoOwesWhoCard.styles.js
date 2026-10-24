import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../theme/colors';

export const createWhoOwesWhoStyles = (tColors = colors, isDark = true) =>
  StyleSheet.create({
    card: {
      backgroundColor: tColors.cardDark,
      borderRadius: 24,
      padding: 20,
      marginHorizontal: 16,
      marginTop: 14,
      borderWidth: 1,
      borderColor: tColors.borderDark,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.28 : 0.04,
      shadowRadius: 18,
      elevation: 4,
      ...(Platform.OS === 'web'
        ? {
            boxShadow: isDark
              ? '0 8px 24px -4px rgba(0, 0, 0, 0.35)'
              : '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
          }
        : {}),
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },
    reconBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 9999,
      backgroundColor: isDark ? '#1E2332' : 'rgba(15, 23, 42, 0.05)',
      borderWidth: 1,
      borderColor: isDark ? '#2A3246' : 'rgba(15, 23, 42, 0.08)',
    },
    reconText: {
      fontSize: 9.5,
      fontWeight: '700',
      color: tColors.textMuted,
      letterSpacing: 0.4,
    },
    title: {
      color: tColors.textDark,
      fontSize: 14.5,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    settledBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 6,
    },
    settledTitle: {
      color: tColors.success,
      fontSize: 14,
      fontWeight: '700',
    },
    settledSub: {
      color: tColors.textMuted,
      fontSize: 12,
      marginTop: 2,
    },
    gridContainer: {
      gap: 10,
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
  });

export const styles = createWhoOwesWhoStyles(colors, true);
