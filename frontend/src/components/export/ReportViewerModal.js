import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createReportViewerStyles } from './ReportViewerModal.styles';
import { useTheme } from '../../context/ThemeContext';

export default function ReportViewerModal({
  visible,
  onClose,
  format = 'xls',
  fileName = '',
  htmlContent = '',
  pdfBlobUrl = '',
  onReDownload,
  onGeneratePdf,
}) {
  const { colors: tColors, isDark } = useTheme();
  const styles = useMemo(() => createReportViewerStyles(tColors, isDark), [tColors, isDark]);

  const [activeMode, setActiveMode] = useState(format === 'pdf' ? 'pdf' : 'excel');
  const [internalPdfUrl, setInternalPdfUrl] = useState(pdfBlobUrl);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const iframeRef = useRef(null);

  // Sync active mode and pdf url when modal opens or format changes
  useEffect(() => {
    if (visible) {
      setActiveMode(format === 'pdf' ? 'pdf' : 'excel');
      setInternalPdfUrl(pdfBlobUrl);
    }
  }, [visible, format, pdfBlobUrl]);

  // When user switches to PDF mode and we don't have a pdf url yet, generate it
  useEffect(() => {
    if (visible && activeMode === 'pdf' && !internalPdfUrl && onGeneratePdf) {
      setGeneratingPdf(true);
      onGeneratePdf().then((url) => {
        setInternalPdfUrl(url);
        setGeneratingPdf(false);
      }).catch((err) => {
        console.error('Error generating PDF for viewer:', err);
        setGeneratingPdf(false);
      });
    }
  }, [visible, activeMode, internalPdfUrl, onGeneratePdf]);

  const isExcel = activeMode === 'excel';
  const badgeColor = isExcel ? '#107C41' : '#E11D48';
  const badgeBg = isDark
    ? isExcel ? 'rgba(16, 124, 65, 0.25)' : 'rgba(225, 29, 72, 0.25)'
    : isExcel ? '#D1FAE5' : '#FFE4E6';

  const handlePrint = () => {
    if (Platform.OS === 'web') {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.print();
      } else {
        window.print();
      }
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Top Navigation Bar */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={tColors.textDark} />
            </TouchableOpacity>

            <View style={styles.fileInfoCol}>
              <View style={styles.fileNameRow}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {fileName || 'Expense_Report'}
                </Text>
                <View style={[styles.formatBadge, { backgroundColor: badgeBg }]}>
                  <Text style={[styles.formatBadgeText, { color: badgeColor }]}>
                    {isExcel ? '.XLS / EXCEL' : '.PDF'}
                  </Text>
                </View>
              </View>
              <View style={styles.downloadStatusRow}>
                <Ionicons name="checkmark-circle" size={13} color="#10B981" />
                <Text style={styles.downloadStatusText}>Saved to local device</Text>
              </View>
            </View>
          </View>

          <View style={styles.topBarActions}>
            {Platform.OS === 'web' && (
              <TouchableOpacity style={styles.actionBtn} onPress={handlePrint} activeOpacity={0.7}>
                <Ionicons name="print-outline" size={15} color={tColors.textDark} />
                <Text style={styles.actionBtnText}>Print</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onReDownload && onReDownload(activeMode)}
              activeOpacity={0.7}
            >
              <Ionicons name="download-outline" size={15} color={tColors.primary} />
              <Text style={[styles.actionBtnText, { color: tColors.primary }]}>Download Again</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* View Mode Switcher: Actual Excel Sheet vs Actual PDF Document */}
        <View style={styles.viewModeToggle}>
          <TouchableOpacity
            style={[styles.viewModeBtn, activeMode === 'excel' && styles.viewModeBtnActive]}
            onPress={() => setActiveMode('excel')}
            activeOpacity={0.8}
          >
            <Text style={[styles.viewModeText, activeMode === 'excel' && styles.viewModeTextActive]}>
              📊 Actual Excel Sheet Preview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeBtn, activeMode === 'pdf' && styles.viewModeBtnActive]}
            onPress={() => setActiveMode('pdf')}
            activeOpacity={0.8}
          >
            <Text style={[styles.viewModeText, activeMode === 'pdf' && styles.viewModeTextActive]}>
              📄 Actual PDF File Preview
            </Text>
          </TouchableOpacity>
        </View>

        {/* Actual File Preview Area */}
        <View style={styles.iframeContainer}>
          {activeMode === 'excel' ? (
            /* EXACT EXCEL HTML SPREADSHEET (ALL 7 TABLES) */
            Platform.OS === 'web' ? (
              <iframe
                ref={iframeRef}
                title="Excel Sheet Preview"
                srcDoc={htmlContent}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  backgroundColor: '#FFFFFF',
                }}
              />
            ) : (
              <View style={styles.loadingBox}>
                <Text style={styles.loadingText}>Excel report downloaded to device.</Text>
              </View>
            )
          ) : (
            /* EXACT PDF DOCUMENT PREVIEW */
            generatingPdf ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={tColors.primary} />
                <Text style={styles.loadingText}>Rendering PDF document...</Text>
              </View>
            ) : internalPdfUrl ? (
              Platform.OS === 'web' ? (
                <iframe
                  ref={iframeRef}
                  title="PDF Document Preview"
                  src={internalPdfUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    backgroundColor: '#525659',
                  }}
                />
              ) : (
                <View style={styles.loadingBox}>
                  <Text style={styles.loadingText}>PDF document downloaded to device.</Text>
                </View>
              )
            ) : (
              <View style={styles.loadingBox}>
                <Text style={styles.loadingText}>Loading PDF preview...</Text>
              </View>
            )
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
