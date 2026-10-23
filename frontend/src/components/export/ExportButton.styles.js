import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../theme/colors';

export const createExportButtonStyles = (tColors = colors, isDark = true) =>
  StyleSheet.create({
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#181B26' : '#FFFFFF',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 9999,
      borderWidth: 1,
      borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
      gap: 5,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: isDark
              ? '0 2px 8px rgba(0, 0, 0, 0.35)'
              : '0 2px 6px rgba(15, 23, 42, 0.04)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }
        : {}),
    },
    text: {
      color: isDark ? '#8E95A5' : tColors.textDark,
      fontSize: 11.5,
      fontWeight: '600',
      letterSpacing: -0.1,
    },
  });

export const styles = createExportButtonStyles(colors, true);
