import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../theme/colors';

export const createPropertyManagersStyles = (tColors = colors, isDark = true) =>
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
      paddingBottom: Platform.OS === 'ios' ? 38 : 24,
      maxHeight: '85%',
      borderWidth: 1,
      borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
      ...(Platform.OS === 'web'
        ? {
            borderRadius: 24,
            maxWidth: 520,
            width: '94%',
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
      marginBottom: 16,
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
      marginTop: 2,
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
    summaryCard: {
      backgroundColor: isDark ? '#181C28' : '#F8FAFC',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? '#252C3F' : '#E2E8F0',
    },
    summaryTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    summaryLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: tColors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    summaryTotal: {
      fontSize: 18,
      fontWeight: '800',
      color: tColors.textDark,
      letterSpacing: -0.3,
    },
    benchmarkText: {
      fontSize: 12,
      color: tColors.textMuted,
      fontWeight: '500',
    },
    listScroll: {
      maxHeight: 380,
    },
    managerCard: {
      backgroundColor: isDark ? '#181C28' : '#F8FAFC',
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: isDark ? '#232838' : '#E2E8F0',
    },
    cardTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: isDark ? '#252C3F' : '#EEF2FF',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: tColors.primary,
    },
    avatarText: {
      fontSize: 14,
      fontWeight: '700',
      color: tColors.primary,
    },
    infoCol: {
      flex: 1,
      minWidth: 0,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    managerName: {
      fontSize: 14.5,
      fontWeight: '700',
      color: tColors.textDark,
      letterSpacing: -0.2,
    },
    youBadge: {
      paddingHorizontal: 6,
      paddingVertical: 1.5,
      borderRadius: 999,
      backgroundColor: isDark ? 'rgba(94, 92, 230, 0.25)' : '#EEF2FF',
    },
    youBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: tColors.primary,
    },
    contactText: {
      fontSize: 11.5,
      color: tColors.textMuted,
      marginTop: 2,
    },
    pctCol: {
      alignItems: 'flex-end',
    },
    pctValue: {
      fontSize: 16,
      fontWeight: '800',
      color: tColors.textDark,
    },
    pctLabel: {
      fontSize: 10,
      color: tColors.textMuted,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    progressTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: isDark ? '#232838' : '#E2E8F0',
      marginTop: 12,
      overflow: 'hidden',
    },
    progressFill: {
      height: 6,
      borderRadius: 3,
      backgroundColor: tColors.primary,
    },
    cardBottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    investedAmountText: {
      fontSize: 12,
      fontWeight: '600',
      color: tColors.textDark,
    },
    statusBadgeText: {
      fontSize: 11,
      fontWeight: '600',
    },
  });
