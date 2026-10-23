import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../theme/colors';

export const createExportOptionsModalStyles = (tColors = colors, isDark = true) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      justifyContent: 'flex-end',
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            justifyContent: 'center',
            alignItems: 'center',
          }
        : {}),
    },
    sheet: {
      backgroundColor: isDark ? '#141721' : '#FFFFFF',
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      paddingHorizontal: 22,
      paddingTop: 16,
      paddingBottom: Platform.OS === 'ios' ? 38 : 26,
      borderWidth: 1,
      borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
      ...(Platform.OS === 'web'
        ? {
            borderRadius: 24,
            maxWidth: 480,
            width: '92%',
            boxShadow: isDark
              ? '0 20px 50px rgba(0, 0, 0, 0.7)'
              : '0 20px 40px rgba(15, 23, 42, 0.12)',
          }
        : {}),
    },
    dragPill: {
      width: 38,
      height: 4,
      borderRadius: 2,
      backgroundColor: isDark ? '#2E3547' : '#E2E8F0',
      alignSelf: 'center',
      marginBottom: 16,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 18,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: tColors.textDark,
      letterSpacing: -0.3,
    },
    sub: {
      fontSize: 12.5,
      color: tColors.textMuted,
      marginTop: 3,
      fontWeight: '500',
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? '#1E2333' : '#F1F5F9',
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionsContainer: {
      gap: 12,
      marginBottom: 8,
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 18,
      backgroundColor: isDark ? '#181C28' : '#F8FAFC',
      borderWidth: 1.5,
      borderColor: isDark ? '#252C3F' : '#E2E8F0',
      gap: 14,
      ...(Platform.OS === 'web'
        ? {
            cursor: 'pointer',
            transition: 'all 0.18s ease',
          }
        : {}),
    },
    optionCardHover: {
      borderColor: tColors.primary,
    },
    iconBox: {
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionTextCol: {
      flex: 1,
    },
    optionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 3,
    },
    optionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: tColors.textDark,
      letterSpacing: -0.2,
    },
    badge: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 6,
    },
    badgeText: {
      fontSize: 10.5,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
    optionDesc: {
      fontSize: 12,
      color: tColors.textMuted,
      lineHeight: 16,
    },
    arrowIcon: {
      marginLeft: 4,
    },
    footerNote: {
      marginTop: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    footerNoteText: {
      fontSize: 11.5,
      color: tColors.textMuted,
      fontWeight: '500',
    },
  });
