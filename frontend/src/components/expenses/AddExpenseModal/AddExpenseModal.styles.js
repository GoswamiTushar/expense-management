import { StyleSheet, Platform } from 'react-native';
import { colors, getLiquidGlass } from '../../../theme/colors';

export const createAddExpenseStyles = (tColors = colors, isDark = true) => {
  const glass = getLiquidGlass(isDark);

  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.72)' : 'rgba(0, 0, 0, 0.36)',
      justifyContent: 'flex-end',
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }
        : {}),
    },
    sheet: {
      backgroundColor: glass.backgroundColor,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      maxHeight: '92%',
      paddingTop: 12,
      paddingBottom: 28,
      borderTopWidth: 1,
      borderTopColor: glass.borderTopColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: isDark ? 0.45 : 0.12,
      shadowRadius: 28,
      elevation: 16,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: glass.backdropFilter,
            WebkitBackdropFilter: glass.backdropFilter,
            boxShadow: `0 -12px 36px rgba(0, 0, 0, ${isDark ? '0.5' : '0.12'}), inset 0 1px 1px 0 ${glass.borderTopColor}`,
            willChange: 'transform, opacity',
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
          }
        : {}),
    },

    dragHandle: {
      width: 40,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.25)'
        : 'rgba(0, 0, 0, 0.16)',
      alignSelf: 'center',
      marginBottom: 10,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 4,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: tColors.borderDark,
    },
    title: {
      color: tColors.textDark,
      fontSize: 17.5,
      fontWeight: '700',
      letterSpacing: -0.3,
    },
    sub: {
      color: tColors.textMuted,
      fontSize: 12,
      fontWeight: '500',
    },
    body: {
      paddingHorizontal: 20,
      paddingTop: 12,
    },
    label: {
      color: tColors.textMuted,
      fontSize: 10.5,
      fontWeight: '700',
      letterSpacing: 0.5,
      marginTop: 10,
      marginBottom: 6,
    },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(0, 0, 0, 0.035)',
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderWidth: 1,
      borderColor: tColors.borderDark,
    },
    currency: {
      color: tColors.primary,
      fontSize: 26,
      fontWeight: '800',
      marginRight: 8,
    },
    amountInput: {
      color: tColors.textDark,
      fontSize: 26,
      fontWeight: '800',
      flex: 1,
    },
    input: {
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(0, 0, 0, 0.035)',
      borderRadius: 14,
      paddingHorizontal: 13,
      paddingVertical: 10,
      color: tColors.textDark,
      fontSize: 13.5,
      borderWidth: 1,
      borderColor: tColors.borderDark,
    },
    submitBtn: {
      backgroundColor: tColors.primary,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      marginTop: 18,
      marginBottom: 12,
      shadowColor: tColors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
    },
    submitText: {
      color: tColors.white,
      fontSize: 14.5,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
  });
};

export const styles = createAddExpenseStyles(colors, true);
