import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../theme/colors';

export const createCategoryFilterStyles = (tColors = colors, isDark = true) =>
  StyleSheet.create({
    scroll: {
      paddingHorizontal: 16,
      gap: 8,
      paddingVertical: 12,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#151821' : '#FFFFFF',
      paddingHorizontal: 14,
      paddingVertical: 7.5,
      borderRadius: 9999,
      borderWidth: 1,
      borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
      gap: 5,
      ...(Platform.OS === 'web'
        ? {
            boxShadow: isDark
              ? '0 2px 6px rgba(0, 0, 0, 0.35)'
              : '0 2px 6px rgba(15, 23, 42, 0.03)',
            cursor: 'pointer',
          }
        : {}),
    },
    chipActive: {
      backgroundColor: isDark ? '#FFFFFF' : '#0F172A',
      borderColor: isDark ? '#FFFFFF' : '#0F172A',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.25 : 0.15,
      shadowRadius: 8,
      elevation: 3,
      ...(Platform.OS === 'web'
        ? {
            boxShadow: isDark
              ? '0 4px 14px rgba(0, 0, 0, 0.35)'
              : '0 4px 12px rgba(15, 23, 42, 0.15)',
          }
        : {}),
    },
    chipText: {
      color: tColors.textMuted,
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: -0.2,
    },
    chipTextActive: {
      color: isDark ? '#0C0E14' : '#FFFFFF',
      fontWeight: '700',
    },
  });

export const styles = createCategoryFilterStyles(colors, true);
