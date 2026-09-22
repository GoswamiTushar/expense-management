import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { buildExcelHtml } from '../../utils/excel/excelWorkbook';

export const exportExpensesToExcel = async ({ property, expenses = [], settlements = [], userMap = {} }) => {
  const htmlContent = buildExcelHtml({ property, expenses, settlements, userMap });
  const propSlug = (property?.name || 'airbnb').toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const fileName = `expenses_${propSlug}_${Date.now()}.xls`;

  if (Platform.OS === 'web') {
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }

  try {
    const filePath = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(filePath, htmlContent, { encoding: FileSystem.EncodingType.UTF8 });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, { mimeType: 'application/vnd.ms-excel', dialogTitle: 'Export Expense Excel' });
    }
    return true;
  } catch (err) {
    console.warn('Native Excel export failed:', err);
    return false;
  }
};
