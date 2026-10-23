import { StyleSheet, Platform } from 'react-native';
import { colors, getLiquidGlass } from '../../../theme/colors';

export const createAddPropertyStyles = (tColors = colors, isDark = true) => {
  const glass = getLiquidGlass(isDark);

  return StyleSheet.create({
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
      backgroundColor: glass.backgroundColor,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      padding: 24,
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
          }
        : {}),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    title: {
      color: tColors.textDark,
      fontSize: 17.5,
      fontWeight: '750',
      letterSpacing: -0.3,
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
      paddingVertical: 13,
      borderRadius: 14,
      alignItems: 'center',
      marginTop: 18,
      marginBottom: 10,
      shadowColor: tColors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 6,
    },
    submitText: {
      color: tColors.white,
      fontSize: 14.5,
      fontWeight: '750',
    },
  });
};

export const styles = createAddPropertyStyles(colors, true);
