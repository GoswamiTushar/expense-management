import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../theme/colors';

export const createReportViewerStyles = (tColors = colors, isDark = true) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0C0E14' : '#F8FAFC',
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingVertical: 12,
      backgroundColor: isDark ? '#141721' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#232838' : '#E2E8F0',
      gap: 12,
      ...(Platform.OS === 'web'
        ? {
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }
        : {}),
    },
    topBarLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
      minWidth: 0,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? '#1C2130' : '#F1F5F9',
      alignItems: 'center',
      justifyContent: 'center',
    },
    fileInfoCol: {
      flex: 1,
      minWidth: 0,
    },
    fileNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    fileName: {
      fontSize: 14.5,
      fontWeight: '700',
      color: tColors.textDark,
      letterSpacing: -0.2,
    },
    formatBadge: {
      paddingHorizontal: 6,
      paddingVertical: 1.5,
      borderRadius: 5,
    },
    formatBadgeText: {
      fontSize: 10,
      fontWeight: '800',
    },
    downloadStatusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 2,
    },
    downloadStatusText: {
      fontSize: 11,
      color: '#10B981',
      fontWeight: '600',
    },
    topBarActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 9999,
      backgroundColor: isDark ? '#1C2130' : '#F1F5F9',
      borderWidth: 1,
      borderColor: isDark ? '#293144' : '#E2E8F0',
    },
    actionBtnText: {
      fontSize: 12,
      fontWeight: '600',
      color: tColors.textDark,
    },
    viewModeToggle: {
      flexDirection: 'row',
      backgroundColor: isDark ? '#11141C' : '#E2E8F0',
      borderRadius: 9999,
      padding: 3,
      marginHorizontal: 18,
      marginTop: 8,
      marginBottom: 8,
      alignSelf: 'center',
    },
    viewModeBtn: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 9999,
    },
    viewModeBtnActive: {
      backgroundColor: isDark ? '#232838' : '#FFFFFF',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    },
    viewModeText: {
      fontSize: 12,
      fontWeight: '600',
      color: tColors.textMuted,
    },
    viewModeTextActive: {
      color: tColors.textDark,
      fontWeight: '700',
    },
    iframeContainer: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    },
    loadingBox: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      backgroundColor: isDark ? '#0C0E14' : '#FFFFFF',
    },
    loadingText: {
      fontSize: 14,
      fontWeight: '600',
      color: tColors.textDark,
    },
  });
