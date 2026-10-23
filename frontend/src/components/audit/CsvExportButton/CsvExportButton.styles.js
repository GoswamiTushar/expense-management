import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const createCsvExportButtonStyles = (tColors = colors, isDark = true) =>
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
    },
    text: {
      color: isDark ? '#8E95A5' : tColors.textDark,
      fontSize: 11.5,
      fontWeight: '600',
      letterSpacing: -0.1,
    },
  });

export const styles = createCsvExportButtonStyles(colors, true);
