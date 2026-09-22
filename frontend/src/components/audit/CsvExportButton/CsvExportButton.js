import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './CsvExportButton.styles';
import { colors } from '../../../theme/colors';
import { exportExpensesToExcel } from '../../../services/export/excelExporter';

export default function CsvExportButton({ expenses = [], property = null, settlements = [], userMap = {} }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (expenses.length === 0) return alert('No expenses to export.');
    setExporting(true);
    await exportExpensesToExcel({ property, expenses, settlements, userMap });
    setExporting(false);
  };

  return (
    <TouchableOpacity style={styles.btn} onPress={handleExport} disabled={exporting} activeOpacity={0.7}>
      {exporting ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <>
          <Ionicons name="document-text-outline" size={13} color={colors.primary} />
          <Text style={styles.text}>Export Excel</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
