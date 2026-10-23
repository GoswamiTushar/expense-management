import React, { useState, useMemo } from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createExportButtonStyles } from './ExportButton.styles';
import { useTheme } from '../../context/ThemeContext';
import { exportExpensesToExcel } from '../../services/export/excelExporter';
import { convertExcelHtmlToPdf } from '../../services/export/excelToPdfConverter';
import { buildExcelHtml } from '../../utils/excel/excelWorkbook';
import ExportOptionsModal from './ExportOptionsModal';
import ReportViewerModal from './ReportViewerModal';

export default function ExportButton({
  expenses = [],
  property = null,
  settlements = [],
  userMap = {},
}) {
  const [showOptions, setShowOptions] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [viewerState, setViewerState] = useState({
    format: 'excel',
    fileName: '',
    htmlContent: '',
    pdfBlobUrl: '',
  });

  const { colors: tColors, isDark } = useTheme();
  const styles = useMemo(() => createExportButtonStyles(tColors, isDark), [tColors, isDark]);

  const handleOpenOptions = () => {
    if (expenses.length === 0) {
      alert('No expenses to export.');
      return;
    }
    setShowOptions(true);
  };

  const handleSelectFormat = async (selectedFormat) => {
    setShowOptions(false);
    setExporting(true);

    const propSlug = (property?.name || 'airbnb').toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const timestamp = Date.now();

    try {
      if (selectedFormat === 'excel') {
        const res = await exportExpensesToExcel({ property, expenses, settlements, userMap });
        setViewerState({
          format: 'excel',
          fileName: res.fileName,
          htmlContent: res.htmlContent,
          pdfBlobUrl: '',
        });
        setShowViewer(true);
      } else {
        const htmlContent = buildExcelHtml({ property, expenses, settlements, userMap });
        const pdfFileName = `expenses_${propSlug}_${timestamp}.pdf`;
        const res = await convertExcelHtmlToPdf(htmlContent, pdfFileName);
        setViewerState({
          format: 'pdf',
          fileName: res.fileName,
          htmlContent: htmlContent,
          pdfBlobUrl: res.blobUrl,
        });
        setShowViewer(true);
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed: ' + (err.message || 'Unknown error'));
    } finally {
      setExporting(false);
    }
  };

  // Helper for on-the-fly PDF generation if user starts in Excel preview and clicks PDF tab
  const handleGeneratePdf = async () => {
    const propSlug = (property?.name || 'airbnb').toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const pdfFileName = `expenses_${propSlug}_${Date.now()}.pdf`;
    const html = viewerState.htmlContent || buildExcelHtml({ property, expenses, settlements, userMap });
    const res = await convertExcelHtmlToPdf(html, pdfFileName);
    setViewerState((prev) => ({ ...prev, pdfBlobUrl: res.blobUrl }));
    return res.blobUrl;
  };

  const handleReDownload = async (mode) => {
    if (mode === 'excel') {
      await exportExpensesToExcel({ property, expenses, settlements, userMap });
    } else {
      await handleGeneratePdf();
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.btn}
        onPress={handleOpenOptions}
        disabled={exporting}
        activeOpacity={0.7}
      >
        {exporting ? (
          <ActivityIndicator size="small" color={tColors.primary} />
        ) : (
          <>
            <Ionicons
              name="download-outline"
              size={13}
              color={isDark ? '#8E95A5' : tColors.textDark}
            />
            <Text style={styles.text}>Export</Text>
          </>
        )}
      </TouchableOpacity>

      <ExportOptionsModal
        visible={showOptions}
        onClose={() => setShowOptions(false)}
        onSelectFormat={handleSelectFormat}
        property={property}
        expenseCount={expenses.length}
      />

      <ReportViewerModal
        visible={showViewer}
        onClose={() => setShowViewer(false)}
        format={viewerState.format}
        fileName={viewerState.fileName}
        htmlContent={viewerState.htmlContent}
        pdfBlobUrl={viewerState.pdfBlobUrl}
        onReDownload={handleReDownload}
        onGeneratePdf={handleGeneratePdf}
      />
    </>
  );
}
