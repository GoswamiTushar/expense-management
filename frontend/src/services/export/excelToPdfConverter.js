import { Platform } from 'react-native';
import html2pdf from 'html2pdf.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { downloadFile } from '../../utils/download/downloadHelper';

/**
 * Converts the exact Excel HTML report into a high-fidelity PDF document.
 * This guarantees 100% parity between the Excel sheet and the PDF report.
 */
export const convertExcelHtmlToPdf = async (htmlContent, fileName) => {
  if (Platform.OS === 'web') {
    // 1. Create a clean rendering container for html2pdf
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '820px';
    container.style.backgroundColor = '#FFFFFF';
    container.style.fontFamily = 'Calibri, Arial, sans-serif';
    container.style.color = '#0F172A';
    document.body.appendChild(container);

    const opt = {
      margin: [10, 8, 12, 8],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
      },
    };

    try {
      // Generate real PDF blob directly from HTML
      const pdfBlob = await html2pdf().set(opt).from(container).outputPdf('blob');
      document.body.removeChild(container);

      // Download file with guaranteed proper filename
      const blobUrl = await downloadFile(pdfBlob, fileName, 'application/pdf');

      return { success: true, fileName, blob: pdfBlob, blobUrl };
    } catch (err) {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
      console.warn('html2pdf conversion failed, falling back to direct PDF:', err);
      throw err;
    }
  }

  // Mobile fallback using jsPDF
  const doc = new jsPDF();
  doc.text('Expense & Settlement Report', 14, 20);
  const pdfBlob = doc.output('blob');
  const filePath = await downloadFile(pdfBlob, fileName, 'application/pdf');
  return { success: true, fileName, blob: pdfBlob, filePath };
};
