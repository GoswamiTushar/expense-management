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
    centerTabItem: {
      flex: 1.15,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 4,
    },
    centerActionBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#5E5CE6',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -20,
      borderWidth: 2,
      borderColor: isDark ? '#0F121A' : '#FFFFFF',
      shadowColor: '#5E5CE6',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.6 : 0.35,
      shadowRadius: 14,
      elevation: 8,
      ...(Platform.OS === 'web'
        ? {
            backgroundImage: 'linear-gradient(135deg, #6C6AF6 0%, #4F46E5 100%)',
            boxShadow: isDark
              ? '0 8px 24px rgba(94, 92, 230, 0.50), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.40)'
              : '0 6px 18px rgba(94, 92, 230, 0.35), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.60)',
            cursor: 'pointer',
            transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          }
        : {}),
    },
    centerTabLabel: {
      fontSize: 10,
      fontWeight: '750',
      color: isDark ? '#A5B4FC' : '#4F46E5',
      letterSpacing: -0.1,
      marginTop: 3,
    },
  });
};

export const styles = createBottomNavStyles(colors, true);
