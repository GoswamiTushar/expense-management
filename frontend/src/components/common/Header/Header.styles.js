import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../theme/colors';

export const createHeaderStyles = (tColors = colors, isDark = true) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? 'rgba(15, 18, 26, 0.92)' : 'rgba(255, 255, 255, 0.92)',
      paddingTop: 12,
      paddingBottom: 13,
      paddingHorizontal: 18,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(255, 255, 255, 0.95)',
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(36px) saturate(200%) contrast(104%)',
            WebkitBackdropFilter: 'blur(36px) saturate(200%) contrast(104%)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: isDark
              ? 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.10), 0 12px 28px -6px rgba(0, 0, 0, 0.55)'
              : 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.95), 0 8px 24px -4px rgba(15, 23, 42, 0.05)',
          }
        : {}),
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    brandBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
      marginRight: 10,
    },
    brandIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: isDark ? '#151821' : '#0F172A',
      borderWidth: 1,
      borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.35 : 0.08,
      shadowRadius: 6,
    },
    brandTitle: {
      color: tColors.textDark,
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: -0.3,
    },
    brandSub: {
      color: tColors.textMuted,
      fontSize: 10.5,
      fontWeight: '500',
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? '#151821' : '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
      ...(Platform.OS === 'web'
        ? {
            boxShadow: isDark
              ? '0 2px 6px rgba(0, 0, 0, 0.35)'
              : '0 2px 6px rgba(15, 23, 42, 0.04)',
            cursor: 'pointer',
          }
        : {}),
    },
    centerTitleBox: {
      flex: 1,
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingLeft: 10,
      paddingRight: 6,
    },
    centerTitle: {
      color: tColors.textDark,
      fontSize: 15.5,
      fontWeight: '700',
      letterSpacing: -0.3,
      textAlign: 'left',
    },
    centerSub: {
      color: tColors.textMuted,
      fontSize: 11,
      fontWeight: '500',
      marginTop: 1,
      textAlign: 'left',
    },
    actionGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      flexShrink: 0,
    },
    iconBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: isDark ? '#151821' : '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
      ...(Platform.OS === 'web'
        ? {
            boxShadow: isDark
              ? '0 2px 6px rgba(0, 0, 0, 0.35)'
              : '0 2px 6px rgba(15, 23, 42, 0.04)',
            cursor: 'pointer',
          }
        : {}),
    },
    badge: {
      position: 'absolute',
      top: -3,
      right: -3,
      backgroundColor: '#5E5CE6',
      borderRadius: 8,
      minWidth: 15,
      height: 15,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: isDark ? '#151821' : '#FFFFFF',
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 8.5,
      fontWeight: '800',
    },
    propertyBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? '#151821' : '#FFFFFF',
      paddingHorizontal: 12,
      paddingVertical: 9.5,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
      ...(Platform.OS === 'web'
        ? {
            boxShadow: isDark
              ? '0 2px 6px rgba(0, 0, 0, 0.35)'
              : '0 2px 6px rgba(15, 23, 42, 0.03)',
            cursor: 'pointer',
          }
        : {}),
    },
    propText: {
      color: tColors.textDark,
      fontSize: 13,
      fontWeight: '600',
      flex: 1,
      letterSpacing: -0.2,
    },
  });

export const styles = createHeaderStyles(colors, true);
