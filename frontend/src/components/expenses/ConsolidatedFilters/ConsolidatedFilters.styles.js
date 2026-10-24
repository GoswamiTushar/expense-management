import { StyleSheet, Platform } from 'react-native';
import { colors, getLiquidGlass } from '../../../theme/colors';

export const createConsolidatedFilterStyles = (tColors = colors, isDark = true) => {
  const glass = getLiquidGlass(isDark);

  return StyleSheet.create({
    container: {
      marginHorizontal: 16,
      marginBottom: 12,
    },
    pillsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      width: '100%',
      paddingVertical: 2,
    },
    pill: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 9,
      borderRadius: 14,
      backgroundColor: isDark ? '#151821' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.09)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: 3,
      elevation: 1,
    },
    pillActive: {
      backgroundColor: isDark ? 'rgba(94, 92, 230, 0.18)' : 'rgba(94, 92, 230, 0.12)',
      borderColor: isDark ? '#7C79F2' : '#5E5CE6',
    },
    pillText: {
      fontSize: 12,
      fontWeight: '600',
      color: tColors.textMuted,
      letterSpacing: -0.2,
      flexShrink: 1,
    },
    pillTextActive: {
      color: isDark ? '#C7D2FE' : '#4338CA',
      fontWeight: '700',
    },
    pillCloseBtn: {
      padding: 2,
      marginLeft: 2,
      borderRadius: 10,
    },
    clearAllBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 18,
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.15)',
    },
    clearAllText: {
      fontSize: 11.5,
      fontWeight: '700',
      color: isDark ? '#FCA5A5' : '#DC2626',
    },

    // Bottom Sheet Styles for Selector
    backdrop: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(0,0,0,0.68)' : 'rgba(0,0,0,0.36)',
      justifyContent: 'flex-end',
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }
        : {}),
    },
    sheet: {
      backgroundColor: glass.backgroundColor,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: Platform.OS === 'ios' ? 36 : 24,
      maxHeight: '75%',
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
      height: 4.5,
      borderRadius: 2.5,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(15, 23, 42, 0.16)',
      alignSelf: 'center',
      marginBottom: 12,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: tColors.borderDark,
      marginBottom: 8,
    },
    sheetTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    sheetTitle: {
      fontSize: 16,
      fontWeight: '750',
      color: tColors.textDark,
      letterSpacing: -0.3,
    },
    sheetCountBadge: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    sheetCountText: {
      fontSize: 11,
      fontWeight: '700',
      color: tColors.textMuted,
    },
    sheetItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 14,
      marginBottom: 4,
    },
    sheetItemActive: {
      backgroundColor: isDark ? 'rgba(94, 92, 230, 0.15)' : 'rgba(94, 92, 230, 0.10)',
    },
    sheetItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    sheetItemIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    },
    sheetItemLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: tColors.textDark,
    },
    sheetItemLabelActive: {
      color: isDark ? '#A5B4FC' : '#4338CA',
      fontWeight: '750',
    },
    sheetItemMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    sheetItemCount: {
      fontSize: 12,
      fontWeight: '600',
      color: tColors.textDim,
    },
  });
};
