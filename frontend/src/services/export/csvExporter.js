import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { buildExpenseCsv } from '../../utils/csvHelper';

export const exportExpensesToCsv = async (expenses = [], users = [], propertyName = '') => {
  const csvContent = buildExpenseCsv(expenses, users, propertyName);
  const fileName = `expenses_${(propertyName || 'airbnb').toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.csv`;

  if (Platform.OS === 'web') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }

  // Native mobile sharing
  try {
    const filePath = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(filePath, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, { mimeType: 'text/csv', dialogTitle: 'Export Expense CSV' });
    }
    return true;
  } catch (err) {
    console.warn('Native CSV share failed:', err);
    return false;
  }
};
