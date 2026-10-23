import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../theme/colors';

export const createEditProfileStyles = (tColors = colors, isDark = true) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.72)' : 'rgba(15, 23, 42, 0.36)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }
        : {}),
    },
    card: {
      backgroundColor: isDark ? '#151821' : '#FFFFFF',
      borderRadius: 24,
      padding: 22,
      width: '100%',
      maxWidth: 420,
      borderWidth: 1,
      borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: isDark ? 0.45 : 0.08,
      shadowRadius: 32,
      elevation: 14,
      ...(Platform.OS === 'web'
        ? {
            boxShadow: isDark
              ? '0 24px 48px -8px rgba(0, 0, 0, 0.70)'
              : '0 16px 36px -6px rgba(15, 23, 42, 0.08)',
          }
        : {}),
    },
    grabber: {
      width: 36,
      height: 4.5,
      borderRadius: 2.5,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.20)'
        : 'rgba(15, 23, 42, 0.14)',
      alignSelf: 'center',
      marginBottom: 14,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    title: {
      color: tColors.textDark,
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: -0.3,
    },
    label: {
      color: tColors.textMuted,
      fontSize: 10.5,
      fontWeight: '700',
      letterSpacing: 0.5,
      marginTop: 12,
      marginBottom: 6,
    },
    input: {
      backgroundColor: isDark ? '#0F1219' : '#F1F5F9',
      borderRadius: 13,
      paddingHorizontal: 13,
      paddingVertical: 11,
      color: tColors.textDark,
      fontSize: 13.5,
      borderWidth: 1,
      borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
    },
    hint: {
      color: tColors.textDim,
      fontSize: 11,
      marginTop: 4,
    },
    appearanceSection: {
      marginTop: 14,
      marginBottom: 6,
    },
    segmentedControl: {
      flexDirection: 'row',
      backgroundColor: isDark ? '#0F1219' : 'rgba(15, 23, 42, 0.05)',
      borderRadius: 13,
      padding: 3,
      borderWidth: 1,
      borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.06)',
    },
    segmentBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 8,
      borderRadius: 10,
    },
    segmentBtnActive: {
      backgroundColor: isDark ? '#1E2332' : '#FFFFFF',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.35 : 0.06,
      shadowRadius: 5,
      elevation: 2,
      ...(Platform.OS === 'web'
        ? {
            boxShadow: isDark
              ? '0 2px 8px rgba(0, 0, 0, 0.45)'
              : '0 2px 8px rgba(15, 23, 42, 0.08)',
          }
        : {}),
    },
    segmentText: {
      fontSize: 12.5,
      fontWeight: '600',
      color: tColors.textMuted,
    },
    segmentTextActive: {
      color: tColors.textDark,
      fontWeight: '700',
    },
    saveBtn: {
      backgroundColor: isDark ? '#5E5CE6' : '#0F172A',
      paddingVertical: 12,
      borderRadius: 14,
      alignItems: 'center',
      marginTop: 18,
      shadowColor: isDark ? '#5E5CE6' : '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.35 : 0.15,
      shadowRadius: 10,
    },
    btnText: {
      color: tColors.white,
      fontSize: 14,
      fontWeight: '700',
    },
    logoutBtn: {
      paddingVertical: 10,
      alignItems: 'center',
      marginTop: 6,
    },
    logoutText: {
      color: tColors.danger,
      fontSize: 13,
      fontWeight: '600',
    },
  });

export const styles = createEditProfileStyles(colors, true);
