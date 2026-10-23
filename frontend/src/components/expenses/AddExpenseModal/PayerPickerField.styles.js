import { StyleSheet } from 'react-native';

export const createPayerPickerStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      marginBottom: 14,
    },
    label: {
      fontSize: 10.5,
      fontWeight: '800',
      letterSpacing: 0.8,
      color: colors.textMuted || '#94A3B8',
      marginBottom: 8,
    },
    chipList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingHorizontal: 11,
      paddingVertical: 7,
      borderRadius: 18,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
    },
    chipActive: {
      backgroundColor: isDark ? 'rgba(99, 102, 241, 0.16)' : '#EEF2FF',
      borderColor: colors.primary || '#6366F1',
    },
    avatar: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: isDark ? '#334155' : '#CBD5E1',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarActive: {
      backgroundColor: colors.primary || '#6366F1',
    },
    avatarText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    chipText: {
      fontSize: 12.5,
      fontWeight: '600',
      color: isDark ? '#E2E8F0' : '#334155',
    },
    chipTextActive: {
      color: colors.primary || '#6366F1',
      fontWeight: '700',
    },
    behalfNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 9,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : '#FEF3C7',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(245, 158, 11, 0.28)' : '#FDE68A',
    },
    behalfNoticeText: {
      fontSize: 11.5,
      fontWeight: '600',
      color: isDark ? '#FBBF24' : '#B45309',
      flex: 1,
    },
  });
