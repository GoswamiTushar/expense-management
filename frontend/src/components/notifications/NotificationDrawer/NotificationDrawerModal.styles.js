import { StyleSheet, Platform } from 'react-native';
import { colors, getLiquidGlass } from '../../../theme/colors';

export const createNotificationStyles = (tColors = colors, isDark = true) => {
  const glass = getLiquidGlass(isDark);

  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(0,0,0,0.68)' : 'rgba(0,0,0,0.34)',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingHorizontal: 0,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }
        : {}),
    },
    card: {
      backgroundColor: glass.backgroundColor,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'ios' ? 48 : Platform.OS === 'android' ? 38 : 22,
      paddingBottom: 14,
      width: '100%',
      maxWidth: 560,
      maxHeight: '82%',
      borderWidth: 1,
      borderTopWidth: 0,
      borderColor: glass.borderColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: isDark ? 0.5 : 0.12,
      shadowRadius: 36,
      elevation: 16,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: glass.backdropFilter,
            WebkitBackdropFilter: glass.backdropFilter,
            boxShadow: `${glass.boxShadow}, 0 24px 48px -12px rgba(0, 0, 0, ${isDark ? '0.6' : '0.12'})`,
            willChange: 'transform, opacity',
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
          }
        : {}),
    },
    bottomHandleBar: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 12,
      paddingBottom: 4,
      width: '100%',
    },
    bottomHandlePill: {
      width: 44,
      height: 5,
      borderRadius: 3,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.18)',
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: tColors.borderDark,
      marginBottom: 12,
    },
    titleGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      color: tColors.textDark,
      fontSize: 17,
      fontWeight: '750',
      letterSpacing: -0.3,
    },
    badge: {
      backgroundColor: tColors.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
    },
    badgeText: {
      color: tColors.white,
      fontSize: 11,
      fontWeight: '800',
    },
    markReadBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: isDark
        ? 'rgba(56, 189, 248, 0.12)'
        : 'rgba(10, 132, 255, 0.10)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark
        ? 'rgba(56, 189, 248, 0.25)'
        : 'rgba(10, 132, 255, 0.20)',
    },
    markReadText: {
      color: '#38BDF8',
      fontSize: 11,
      fontWeight: '700',
    },
    browserPermCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark
        ? 'rgba(14, 165, 233, 0.08)'
        : 'rgba(14, 165, 233, 0.06)',
      borderWidth: 1,
      borderColor: 'rgba(14, 165, 233, 0.25)',
      borderRadius: 14,
      padding: 11,
      marginBottom: 12,
    },
    browserPermLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      marginRight: 8,
    },
    browserPermText: {
      color: '#38BDF8',
      fontSize: 11.5,
      fontWeight: '600',
      flex: 1,
    },
    enableBtn: {
      backgroundColor: '#0284C7',
      paddingHorizontal: 11,
      paddingVertical: 5,
      borderRadius: 10,
    },
    enableBtnText: {
      color: tColors.white,
      fontSize: 11,
      fontWeight: '800',
    },
    item: {
      flexDirection: 'row',
      backgroundColor: tColors.cardDark,
      borderRadius: 14,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: tColors.borderDark,
      gap: 10,
    },
    itemUnread: {
      borderColor: isDark ? 'rgba(56, 189, 248, 0.40)' : 'rgba(10, 132, 255, 0.35)',
      backgroundColor: isDark
        ? 'rgba(15, 23, 42, 0.90)'
        : 'rgba(240, 249, 255, 0.95)',
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemContent: {
      flex: 1,
    },
    itemTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 3,
    },
    itemTitle: {
      color: tColors.textDark,
      fontSize: 13,
      fontWeight: '700',
    },
    itemTime: {
      color: tColors.textMuted,
      fontSize: 10.5,
    },
    itemBody: {
      color: tColors.textMuted,
      fontSize: 12,
      lineHeight: 16,
    },
    unreadDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: '#38BDF8',
      position: 'absolute',
      top: 8,
      right: 8,
    },
    emptyBox: {
      alignItems: 'center',
      paddingVertical: 32,
      gap: 6,
    },
    emptyTitle: {
      color: tColors.textDark,
      fontSize: 14.5,
      fontWeight: '700',
      marginTop: 6,
    },
    emptySub: {
      color: tColors.textMuted,
      fontSize: 12,
      textAlign: 'center',
      maxWidth: 280,
    },
  });
};

export const styles = createNotificationStyles(colors, true);
