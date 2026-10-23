import { StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';

export const createAppStyles = (tColors = colors, isDark = true) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: tColors.bgDark,
    },
    container: {
      flex: 1,
      maxWidth: 600,
      width: '100%',
      alignSelf: 'center',
      backgroundColor: tColors.bgDark,
      ...(Platform.OS === 'web'
        ? {
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: tColors.borderDark,
            backgroundColor: isDark ? '#0C0E14' : '#F8FAFC',
            backgroundImage: isDark
              ? 'radial-gradient(ellipse at 50% 0%, rgba(94, 92, 230, 0.08) 0%, rgba(12, 14, 20, 0) 55%)'
              : 'none',
            boxShadow: isDark
              ? '0 0 50px rgba(0, 0, 0, 0.65)'
              : '0 0 32px rgba(15, 23, 42, 0.04)',
          }
        : {}),
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      marginTop: 22,
      marginBottom: 10,
      flexWrap: 'wrap',
      gap: 8,
    },
    sectionTitleBox: {
      minWidth: 110,
      flexShrink: 1,
    },
    title: {
      color: tColors.textDark,
      fontSize: 16.5,
      fontWeight: '700',
      letterSpacing: -0.3,
    },
    sub: {
      color: tColors.textMuted,
      fontSize: 11.5,
      fontWeight: '500',
      marginTop: 2,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#181B26' : '#FFFFFF',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 9999,
      borderWidth: 1,
      borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
      gap: 6,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: isDark
              ? '0 2px 8px rgba(0, 0, 0, 0.35)'
              : '0 2px 6px rgba(15, 23, 42, 0.04)',
          }
        : {}),
    },
    btnText: {
      color: tColors.textDark,
      fontSize: 11.5,
      fontWeight: '600',
    },
    fab: {
      position: 'absolute',
      bottom: 26,
      right: 22,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#FFFFFF' : '#0F172A',
      paddingVertical: 13,
      paddingHorizontal: 20,
      borderRadius: 9999,
      elevation: 8,
      gap: 7,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      ...(Platform.OS === 'web'
        ? {
            boxShadow: isDark
              ? '0 8px 24px rgba(0, 0, 0, 0.50)'
              : '0 8px 20px rgba(15, 23, 42, 0.18)',
          }
        : {}),
    },
    fabText: {
      color: isDark ? '#0C0E14' : '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    emptyBox: {
      backgroundColor: tColors.cardDark,
      borderRadius: 22,
      padding: 28,
      marginHorizontal: 18,
      marginTop: 18,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: tColors.borderDark,
      ...(Platform.OS === 'web'
        ? {
            boxShadow: isDark
              ? '0 8px 24px rgba(0, 0, 0, 0.25)'
              : '0 4px 16px rgba(15, 23, 42, 0.04)',
          }
        : {}),
    },
    emptyTitle: {
      color: tColors.textDark,
      fontSize: 16,
      fontWeight: '700',
      marginTop: 12,
      letterSpacing: -0.3,
    },
    emptySub: {
      color: tColors.textMuted,
      fontSize: 12.5,
      textAlign: 'center',
      marginTop: 4,
      marginBottom: 16,
      lineHeight: 18,
    },
    emptyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: tColors.primary,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 9999,
      gap: 6,
      shadowColor: tColors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    emptyBtnText: {
      color: tColors.white,
      fontSize: 13,
      fontWeight: '700',
    },
  });

export const styles = createAppStyles(colors, true);
