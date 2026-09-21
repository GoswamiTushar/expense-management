import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './CsvExportButton.styles';
import { colors } from '../../../theme/colors';
import { exportExpensesToCsv } from '../../../services/export/csvExporter';

export default function CsvExportButton({ expenses = [], propertyName = '' }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (expenses.length === 0) return alert('No expenses to export.');
    setExporting(true);
    await exportExpensesToCsv(expenses, [], propertyName);
    setExporting(false);
  };

  return (
    <TouchableOpacity style={styles.btn} onPress={handleExport} disabled={exporting} activeOpacity={0.7}>
      {exporting ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <>
          <Ionicons name="download-outline" size={14} color={colors.primary} />
          <Text style={styles.text}>Export CSV</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
