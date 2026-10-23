import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../theme/colors';

export const createChronoAuditStyles = (tColors = colors, isDark = true) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(0,0,0,0.72)' : 'rgba(0,0,0,0.36)',
      justifyContent: 'flex-end',
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }
        : {}),
    },
    sheet: {
      backgroundColor: isDark ? '#151821' : '#FFFFFF',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      maxHeight: '90%',
      paddingTop: 12,
      paddingBottom: 28,
      paddingHorizontal: 20,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: isDark ? 0.45 : 0.12,
      shadowRadius: 28,
      elevation: 16,
      ...(Platform.OS === 'web'
        ? {
            boxShadow: `0 -12px 36px rgba(0, 0, 0, ${isDark ? '0.55' : '0.12'}), inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)`,
          }
        : {}),
    },
    dragHandle: {
      width: 40,
      height: 4.5,
      borderRadius: 2.5,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.16)',
      alignSelf: 'center',
      marginBottom: 10,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    title: {
      color: tColors.textDark,
      fontSize: 17,
      fontWeight: '750',
      letterSpacing: -0.3,
    },
    sub: {
      color: tColors.textMuted,
      fontSize: 12,
      marginBottom: 12,
    },
    item: {
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.035)',
      borderRadius: 14,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: tColors.borderDark,
    },
    itemTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    actor: {
      color: tColors.textDark,
      fontSize: 13,
      fontWeight: '700',
    },
    amount: {
      color: tColors.primary,
      fontSize: 13.5,
      fontWeight: '800',
    },
    desc: {
      color: tColors.textMuted,
      fontSize: 12,
      marginTop: 3,
    },
    time: {
      color: tColors.textDim,
      fontSize: 10.5,
      marginTop: 4,
    },
  });

export const styles = createChronoAuditStyles(colors, true);
