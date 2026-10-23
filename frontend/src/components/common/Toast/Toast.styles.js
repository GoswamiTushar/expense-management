import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../theme/colors';

export const createToastStyles = (tColors = colors, isDark = true) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      left: 16,
      right: 16,
      zIndex: 9999,
      alignItems: 'center',
    },
    card: {
      maxWidth: 500,
      width: '100%',
      backgroundColor: isDark
        ? 'rgba(28, 28, 30, 0.88)'
        : 'rgba(255, 255, 255, 0.94)',
      borderRadius: 20,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark
        ? 'rgba(255, 255, 255, 0.14)'
        : 'rgba(0, 0, 0, 0.08)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.4 : 0.12,
      shadowRadius: 18,
      elevation: 10,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(32px) saturate(190%)',
            WebkitBackdropFilter: 'blur(32px) saturate(190%)',
          }
        : {}),
    },
    iconBox: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: tColors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      shadowColor: tColors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 6,
    },
    content: { flex: 1 },
    title: { color: tColors.textDark, fontSize: 13.5, fontWeight: '750', marginBottom: 2 },
    message: { color: tColors.textMuted, fontSize: 12, lineHeight: 16 },
  });

export const styles = createToastStyles(colors, true);
