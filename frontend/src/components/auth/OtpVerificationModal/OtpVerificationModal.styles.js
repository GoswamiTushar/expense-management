import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../theme/colors';

export const createOtpStyles = (tColors = colors, isDark = true) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(0,0,0,0.70)' : 'rgba(0,0,0,0.35)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }
        : {}),
    },
    card: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: isDark
        ? 'rgba(28, 28, 30, 0.90)'
        : 'rgba(255, 255, 255, 0.95)',
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: isDark
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(0, 0, 0, 0.08)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.45 : 0.12,
      shadowRadius: 24,
      elevation: 12,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(32px) saturate(190%)',
            WebkitBackdropFilter: 'blur(32px) saturate(190%)',
          }
        : {}),
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { color: tColors.textDark, fontSize: 18, fontWeight: '750', letterSpacing: -0.3 },
    sub: { color: tColors.textMuted, fontSize: 13, marginTop: 6, lineHeight: 18 },
    emailText: { color: tColors.primary, fontWeight: '700' },
    label: { color: tColors.textDim, fontSize: 11, fontWeight: '700', marginTop: 18, marginBottom: 6, letterSpacing: 0.5 },
    input: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: tColors.textDark,
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: 8,
      textAlign: 'center',
      borderWidth: 1,
      borderColor: tColors.borderDark,
    },
    errorText: { color: '#FF3B30', fontSize: 12, fontWeight: '700', textAlign: 'center', marginTop: 8 },
    verifyBtn: {
      backgroundColor: tColors.primary,
      paddingVertical: 13,
      borderRadius: 14,
      alignItems: 'center',
      marginTop: 16,
      shadowColor: tColors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
    },
    verifyText: { color: tColors.white, fontSize: 14.5, fontWeight: '750' },
    resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 14, gap: 4 },
    resendPrompt: { color: tColors.textMuted, fontSize: 12 },
    resendLink: { color: tColors.primary, fontSize: 12, fontWeight: '700' },
  });

export const styles = createOtpStyles(colors, true);
