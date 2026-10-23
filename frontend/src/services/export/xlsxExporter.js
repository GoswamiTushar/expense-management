import * as XLSX from 'xlsx';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getCategoryById } from '../../theme/categories';
import { calculatePropertyDebts } from '../../utils/excel/excelDebts';

/**
 * Builds structured data and exports a genuine .xlsx workbook
 */
export const generateWorkbookData = ({ property, expenses = [], settlements = [], userMap = {} }) => {
  const activeExpenses = expenses.filter(
    (e) => !e.isDeleted && !e.deleted && e.deleted !== 'Y' && e.isDeleted !== 'Y'
  );
  const managers = property?.managerDetails || property?.managers?.map((id) => userMap[id] || { id, name: id }) || [];
  const getName = (id) => userMap[id]?.name || id;

  // 1. Expenses Sheet
  const expensesRows = activeExpenses.map((exp, idx) => {
    const d = new Date(exp.date || exp.createdAt);
    const dateStr = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : 'N/A';
    const timeStr = !isNaN(d.getTime()) ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';
    const splitNames = (exp.splitAmong || []).map(getName).join(', ') || 'All';
    const splitCount = (exp.splitAmong || []).length || 1;
    const share = exp.sharePerPerson || Math.round((Number(exp.amount || 0) / splitCount) * 100) / 100;
    const catLabel = getCategoryById(exp.category)?.label || exp.category || 'General';

    return {
      '#': idx + 1,
      'Date': dateStr,
      'Time': timeStr,
      'Title / Description': exp.title || 'Untitled',
      'Category': catLabel,
      'Total Amount (INR)': Number(exp.amount || 0),
      'Paid By': getName(exp.paidBy),
      'Split With': splitNames,
      'Split Count': splitCount,
      'Share Per Person (INR)': share,
      'Notes': exp.notes || '',
    };
  });

  // 2. Manager Summary Sheet
  const managerRows = managers.map((m, idx) => {
    const paid = activeExpenses.filter((e) => e.paidBy === m.id).reduce((s, e) => s + Number(e.amount || 0), 0);
    const share = activeExpenses.reduce((s, e) => {
      const splits = e.splitAmong || [];
      if (!splits.includes(m.id)) return s;
      return s + (Number(e.sharePerPerson) || (Number(e.amount || 0) / (splits.length || 1)));
    }, 0);
    const net = Math.round((paid - share) * 100) / 100;
    const status = net > 0 ? `Gets Back INR ${net.toFixed(2)}` : net < 0 ? `Owes INR ${Math.abs(net).toFixed(2)}` : 'Settled';

    return {
      '#': idx + 1,
      'Manager Name': m.name,
      'Email': m.email || 'N/A',
      'Total Paid (INR)': Math.round(paid * 100) / 100,
      'Fair Share (INR)': Math.round(share * 100) / 100,
      'Net Balance (INR)': net,
      'Settlement Status': status,
    };
  });

  // 3. Category Breakdown Sheet
  const totalSpend = activeExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const catMap = {};
  activeExpenses.forEach((e) => {
    const cat = e.category || 'other';
    if (!catMap[cat]) catMap[cat] = { count: 0, total: 0 };
    catMap[cat].count += 1;
    catMap[cat].total += Number(e.amount || 0);
  });

  const categoryRows = Object.keys(catMap).map((catKey, idx) => {
    const catLabel = getCategoryById(catKey)?.label || catKey;
    const cTotal = catMap[catKey].total;
    const pct = totalSpend > 0 ? Math.round((cTotal / totalSpend) * 1000) / 10 : 0;
    return {
      '#': idx + 1,
      'Category': catLabel,
      'Transactions': catMap[catKey].count,
      'Total Spent (INR)': Math.round(cTotal * 100) / 100,
      'Percentage (%)': `${pct}%`,
    };
  });

  // 4. Pairwise Debts & Settlements Sheet
  const debts = calculatePropertyDebts(managers, activeExpenses, settlements, userMap);
  const debtsRows = debts.map((d, idx) => ({
    '#': idx + 1,
    'Debtor (Who Pays)': d.from,
    'Creditor (Who Receives)': d.to,
    'Amount Due (INR)': d.amount,
    'Status': 'Pending Settlement',
  }));

  // 5. Settlement History Sheet
  const settlementRows = (settlements || []).map((s, idx) => {
    const d = new Date(s.createdAt);
    const dateStr = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : 'N/A';
    return {
      '#': idx + 1,
      'Paid By': getName(s.settledBy),
      'Paid To': getName(s.paidTo),
      'Amount (INR)': Number(s.amount || 0),
      'Payment Method': s.paymentMethod || 'Cash',
      'Status': (s.status || 'pending').toUpperCase(),
      'Date': dateStr,
      'Notes': s.notes || '',
    };
  });

  return {
    property,
    expensesRows,
    managerRows,
    categoryRows,
    debtsRows,
    settlementRows,
    totalSpend,
  };
};

/**
 * Generates and downloads real binary .xlsx file
 */
export const exportExpensesToXlsx = async ({ property, expenses = [], settlements = [], userMap = {} }) => {
  const data = generateWorkbookData({ property, expenses, settlements, userMap });
  const wb = XLSX.utils.book_new();

  // Create worksheets
  const wsExpenses = XLSX.utils.json_to_sheet(data.expensesRows);
  const wsManagers = XLSX.utils.json_to_sheet(data.managerRows);
  const wsCategories = XLSX.utils.json_to_sheet(data.categoryRows);
  const wsDebts = XLSX.utils.json_to_sheet(data.debtsRows.length > 0 ? data.debtsRows : [{ 'Notice': 'Zero Pending Dues - All balances fully settled!' }]);
  const wsSettlements = XLSX.utils.json_to_sheet(data.settlementRows.length > 0 ? data.settlementRows : [{ 'Notice': 'No recorded settlements yet.' }]);

  // Set column widths for clean readability
  const setCols = (ws, widths) => {
    ws['!cols'] = widths.map((w) => ({ wch: w }));
  };
  setCols(wsExpenses, [5, 12, 10, 26, 16, 18, 18, 26, 12, 22, 24]);
  setCols(wsManagers, [5, 20, 24, 18, 18, 18, 24]);
  setCols(wsCategories, [5, 20, 14, 18, 16]);
  setCols(wsDebts, [5, 22, 24, 18, 20]);
  setCols(wsSettlements, [5, 20, 20, 16, 16, 14, 14, 22]);

  XLSX.utils.book_append_sheet(wb, wsExpenses, 'Expenses Ledger');
  XLSX.utils.book_append_sheet(wb, wsManagers, 'Manager Balances');
  XLSX.utils.book_append_sheet(wb, wsCategories, 'Category Breakdown');
  XLSX.utils.book_append_sheet(wb, wsDebts, 'Pending Dues');
  XLSX.utils.book_append_sheet(wb, wsSettlements, 'Settlement History');

  const propSlug = (property?.name || 'airbnb').toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const fileName = `expenses_${propSlug}_${Date.now()}.xlsx`;

  if (Platform.OS === 'web') {
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    return { success: true, fileName, data };
  }

  try {
    const base64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
    const filePath = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(filePath, base64, { encoding: FileSystem.EncodingType.Base64 });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Export Expense Spreadsheet (.xlsx)',
      });
    }
    return { success: true, fileName, data };
  } catch (err) {
    console.warn('Native Excel export failed:', err);
    return { success: false, error: err.message, data };
  }
};
