import { StyleSheet, Platform } from 'react-native';
import { colors, getLiquidGlass } from '../../../theme/colors';

export const createPropertyPickerStyles = (tColors = colors, isDark = true) => {
  const glass = getLiquidGlass(isDark);

  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.72)' : 'rgba(0, 0, 0, 0.36)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }
        : {}),
    },
    card: {
      backgroundColor: glass.backgroundColor,
      borderRadius: 26,
      padding: 22,
      width: '100%',
      maxWidth: 420,
      borderWidth: 1,
      borderColor: glass.borderColor,
      borderTopColor: glass.borderTopColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: isDark ? 0.48 : 0.12,
      shadowRadius: 36,
      elevation: 16,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: glass.backdropFilter,
            WebkitBackdropFilter: glass.backdropFilter,
            boxShadow: `${glass.boxShadow}, 0 24px 48px -12px rgba(0, 0, 0, ${isDark ? '0.6' : '0.12'})`,
          }
        : {}),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    title: {
      color: tColors.textDark,
      fontSize: 17,
      fontWeight: '750',
      letterSpacing: -0.3,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: tColors.cardDark,
      borderRadius: 14,
      padding: 13,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: tColors.borderDark,
    },
    itemActive: {
      borderColor: tColors.primary,
      backgroundColor: isDark
        ? 'rgba(94, 92, 230, 0.14)'
        : 'rgba(94, 92, 230, 0.08)',
    },
    name: {
      color: tColors.textDark,
      fontSize: 14,
      fontWeight: '700',
    },
    loc: {
      color: tColors.textMuted,
      fontSize: 11.5,
      marginTop: 2,
    },
    inviteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 9999,
      backgroundColor: isDark ? '#232838' : '#EEF2FF',
      borderWidth: 1,
      borderColor: isDark ? '#323B4F' : '#E0E7FF',
      marginRight: 6,
      ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
    },
    inviteBtnText: {
      fontSize: 11,
      fontWeight: '600',
      color: tColors.primary,
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: tColors.primary,
      paddingVertical: 12,
      borderRadius: 14,
      marginTop: 8,
      gap: 6,
      shadowColor: tColors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 6,
    },
    addText: {
      color: tColors.white,
      fontSize: 13.5,
      fontWeight: '700',
    },
  });
};

export const styles = createPropertyPickerStyles(colors, true);
