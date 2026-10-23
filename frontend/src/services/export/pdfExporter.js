import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { generateWorkbookData } from './xlsxExporter';

/**
 * Generates and downloads a clean, professional PDF financial statement
 */
export const exportExpensesToPdf = async ({ property, expenses = [], settlements = [], userMap = {} }) => {
  const data = generateWorkbookData({ property, expenses, settlements, userMap });
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  let currentY = margin;

  // --- Header Banner ---
  doc.setFillColor(15, 23, 42); // #0F172A Dark Slate
  doc.rect(margin, currentY, pageWidth - margin * 2, 60, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('AIRBNB FINANCIAL & EXPENSE STATEMENT', margin + 16, currentY + 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(148, 163, 184); // #94A3B8
  const propName = property?.name || 'Property Report';
  const genDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Property: ${propName} • Generated on ${genDate}`, margin + 16, currentY + 44);

  currentY += 72;

  // --- KPI Metric Summary Boxes ---
  const boxWidth = (pageWidth - margin * 2 - 20) / 3;
  const boxHeight = 44;

  const kpis = [
    { label: 'TOTAL EXPENDITURE', val: `INR ${data.totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
    { label: 'TRANSACTIONS', val: `${expenses.length} Logged Expenses` },
    { label: 'MANAGERS INVOLVED', val: `${data.managerRows.length} Property Managers` },
  ];

  kpis.forEach((kpi, idx) => {
    const x = margin + idx * (boxWidth + 10);
    doc.setFillColor(248, 250, 252); // #F8FAFC
    doc.setDrawColor(226, 232, 240); // #E2E8F0
    doc.roundedRect(x, currentY, boxWidth, boxHeight, 4, 4, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 10, currentY + 16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.val, x + 10, currentY + 34);
  });

  currentY += boxHeight + 18;

  // Helper for section headings
  const addSectionTitle = (title, color = [67, 56, 202]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(title, margin, currentY);
    currentY += 8;
  };

  // --- Section 1: Manager Balances ---
  addSectionTitle('1. Manager Spending & Settlement Balances');
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    head: [['Manager Name', 'Total Paid (INR)', 'Fair Share (INR)', 'Net Balance (INR)', 'Status']],
    body: data.managerRows.map((m) => [
      m['Manager Name'],
      `INR ${m['Total Paid (INR)'].toFixed(2)}`,
      `INR ${m['Fair Share (INR)'].toFixed(2)}`,
      `INR ${m['Net Balance (INR)'].toFixed(2)}`,
      m['Settlement Status'],
    ]),
    headStyles: {
      fillColor: [67, 56, 202], // Indigo
      textColor: 255,
      fontSize: 8.5,
      fontStyle: 'bold',
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 4.5,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  currentY = doc.lastAutoTable.finalY + 18;

  // --- Section 2: Category Breakdown ---
  if (currentY > pageHeight - 120) {
    doc.addPage();
    currentY = margin;
  }

  addSectionTitle('2. Expenditure by Category', [13, 148, 136]);
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    head: [['Category', 'Transactions', 'Total Spent (INR)', '% Share']],
    body: data.categoryRows.map((c) => [
      c['Category'],
      String(c['Transactions']),
      `INR ${c['Total Spent (INR)'].toFixed(2)}`,
      c['Percentage (%)'],
    ]),
    headStyles: {
      fillColor: [13, 148, 136], // Teal
      textColor: 255,
      fontSize: 8.5,
      fontStyle: 'bold',
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 4.5,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  currentY = doc.lastAutoTable.finalY + 18;

  // --- Section 3: Itemized Expenses ---
  if (currentY > pageHeight - 150) {
    doc.addPage();
    currentY = margin;
  }

  addSectionTitle('3. Itemized Expenses Record', [190, 24, 93]);
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'striped',
    head: [['#', 'Date', 'Description', 'Category', 'Paid By', 'Amount (INR)', 'Split With']],
    body: data.expensesRows.map((e) => [
      String(e['#']),
      e['Date'],
      e['Title / Description'],
      e['Category'],
      e['Paid By'],
      `INR ${e['Total Amount (INR)'].toFixed(2)}`,
      e['Split With'],
    ]),
    headStyles: {
      fillColor: [190, 24, 93], // Rose
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 4.5,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 4,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 55 },
      2: { cellWidth: 120 },
      3: { cellWidth: 70 },
      4: { cellWidth: 75 },
      5: { cellWidth: 65, halign: 'right' },
      6: { cellWidth: 'auto' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  currentY = doc.lastAutoTable.finalY + 18;

  // --- Section 4: Settlement History ---
  if (data.settlementRows.length > 0) {
    if (currentY > pageHeight - 140) {
      doc.addPage();
      currentY = margin;
    }

    addSectionTitle('4. Settlements & Audit Trail', [180, 83, 9]);
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      head: [['#', 'Paid By', 'Paid To', 'Amount (INR)', 'Method', 'Status', 'Date']],
      body: data.settlementRows.map((s) => [
        String(s['#']),
        s['Paid By'],
        s['Paid To'],
        `INR ${s['Amount (INR)'].toFixed(2)}`,
        s['Payment Method'],
        s['Status'],
        s['Date'],
      ]),
      headStyles: {
        fillColor: [180, 83, 9], // Amber
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        cellPadding: 4.5,
      },
      bodyStyles: {
        fontSize: 7.5,
        cellPadding: 4,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });
  }

  // --- Add Page Numbers on all pages ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${totalPages} • Airbnb Expense Manager Statement`,
      margin,
      pageHeight - 16
    );
  }

  const propSlug = (property?.name || 'airbnb').toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const fileName = `expenses_${propSlug}_${Date.now()}.pdf`;

  if (Platform.OS === 'web') {
    doc.save(fileName);
    return { success: true, fileName, data, doc };
  }

  try {
    const base64 = doc.output('datauristring').split(',')[1];
    const filePath = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(filePath, base64, { encoding: FileSystem.EncodingType.Base64 });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/pdf',
        dialogTitle: 'Export Expense Statement (.pdf)',
      });
    }
    return { success: true, fileName, data, doc };
  } catch (err) {
    console.warn('Native PDF export failed:', err);
    return { success: false, error: err.message, data, doc };
  }
};
