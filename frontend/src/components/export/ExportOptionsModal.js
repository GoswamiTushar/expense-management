import React, { useMemo, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, Platform, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createExportOptionsModalStyles } from './ExportOptionsModal.styles';
import { useTheme } from '../../context/ThemeContext';

export default function ExportOptionsModal({
  visible,
  onClose,
  onSelectFormat,
  property,
  expenseCount = 0,
}) {
  const { colors: tColors, isDark } = useTheme();
  const styles = useMemo(() => createExportOptionsModalStyles(tColors, isDark), [tColors, isDark]);

  useEffect(() => {
    if (!visible) return;

    if (Platform.OS === 'android') {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        onClose();
        return true;
      });
      return () => sub.remove();
    }

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.history.pushState({ exportOptions: true }, '');
      const handlePop = () => onClose();
      window.addEventListener('popstate', handlePop);
      return () => window.removeEventListener('popstate', handlePop);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.dragPill} />

          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Export Financial Report</Text>
              <Text style={styles.sub}>
                {property?.name || 'Property'} • {expenseCount} Records
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={18} color={tColors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            {/* Option 1: Excel (.xls / .xlsx) */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => onSelectFormat('excel')}
              activeOpacity={0.75}
            >
              <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(16, 124, 65, 0.18)' : '#ECFDF5' }]}>
                <Ionicons name="grid-outline" size={24} color="#107C41" />
              </View>
              <View style={styles.optionTextCol}>
                <View style={styles.optionTitleRow}>
                  <Text style={styles.optionTitle}>Export in Excel</Text>
                  <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(16, 124, 65, 0.25)' : '#D1FAE5' }]}>
                    <Text style={[styles.badgeText, { color: '#107C41' }]}>.XLS / EXCEL</Text>
                  </View>
                </View>
                <Text style={styles.optionDesc}>
                  Complete multi-table spreadsheet with Overview, Manager Splits, Category Details & Settlement Ledgers.
                </Text>
              </View>
              <Ionicons name="download-outline" size={20} color={tColors.textMuted} style={styles.arrowIcon} />
            </TouchableOpacity>

            {/* Option 2: PDF (.pdf) */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => onSelectFormat('pdf')}
              activeOpacity={0.75}
            >
              <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(225, 29, 72, 0.18)' : '#FFF1F2' }]}>
                <Ionicons name="document-text-outline" size={24} color="#E11D48" />
              </View>
              <View style={styles.optionTextCol}>
                <View style={styles.optionTitleRow}>
                  <Text style={styles.optionTitle}>Export in PDF</Text>
                  <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(225, 29, 72, 0.25)' : '#FFE4E6' }]}>
                    <Text style={[styles.badgeText, { color: '#E11D48' }]}>.PDF</Text>
                  </View>
                </View>
                <Text style={styles.optionDesc}>
                  Direct PDF conversion of the agreed Excel report for printing, archiving & instant sharing.
                </Text>
              </View>
              <Ionicons name="download-outline" size={20} color={tColors.textMuted} style={styles.arrowIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.footerNote}>
            <Ionicons name="shield-checkmark-outline" size={13} color={tColors.textMuted} />
            <Text style={styles.footerNoteText}>
              Downloads file with proper name & opens actual file preview in-app
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
