import { StyleSheet, Platform } from 'react-native';
import { colors, getLiquidGlass } from '../../../theme/colors';

export const createBottomNavStyles = (tColors = colors, isDark = true) => {
  const glass = getLiquidGlass(isDark);

  return StyleSheet.create({
    container: {
      backgroundColor: isDark
        ? 'rgba(15, 18, 26, 0.92)'
        : 'rgba(255, 255, 255, 0.92)',
      borderTopWidth: 1,
      borderTopColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
      borderBottomWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingTop: 8,
      paddingBottom: Platform.OS === 'ios' ? 24 : 10,
      paddingHorizontal: 8,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(32px) saturate(190%) contrast(104%)',
            WebkitBackdropFilter: 'blur(32px) saturate(190%) contrast(104%)',
            position: 'sticky',
            bottom: 0,
            zIndex: 100,
            boxShadow: isDark
              ? 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.10), 0 -8px 24px rgba(0, 0, 0, 0.55)'
              : 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.95), 0 -4px 18px rgba(15, 23, 42, 0.05)',
          }
        : {
            elevation: 16,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: isDark ? 0.35 : 0.08,
            shadowRadius: 16,
          }),
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 4,
      gap: 3,
    },
    tabLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: tColors.textMuted,
      letterSpacing: -0.1,
    },
    tabLabelActive: {
      color: isDark ? '#FFFFFF' : '#0F172A',
      fontWeight: '750',
    },
    activeDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: isDark ? tColors.primary : '#0F172A',
      marginTop: 1,
    },
    centerBtnWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerBtn: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: isDark ? '#FFFFFF' : '#0F172A',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -14,
      borderWidth: 2,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.95)',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.45 : 0.20,
      shadowRadius: 12,
      elevation: 8,
      ...(Platform.OS === 'web'
        ? {
            boxShadow: isDark
              ? '0 8px 22px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
              : '0 6px 18px rgba(15, 23, 42, 0.20), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
            cursor: 'pointer',
          }
        : {}),
    },
  });
};

export const styles = createBottomNavStyles(colors, true);
