import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './DatePickerField.styles';
import { colors } from '../../../theme/colors';
import { formatDate } from '../../../utils/date';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const formatYMD = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function DatePickerField({
  selectedDate,
  onSelectDate,
  disabled = false,
  disabledMessage = '',
  label = 'EXPENSE DATE',
  required = true,
}) {
  const [modalVisible, setModalVisible] = useState(false);

  // Initialize view month/year based on selectedDate or today
  const [viewYear, setViewYear] = useState(() => {
    if (selectedDate && /^\d{4}-\d{2}-\d{2}/.test(selectedDate)) {
      return parseInt(selectedDate.substring(0, 4), 10);
    }
    return new Date().getFullYear();
  });

  const [viewMonth, setViewMonth] = useState(() => {
    if (selectedDate && /^\d{4}-\d{2}-\d{2}/.test(selectedDate)) {
      return parseInt(selectedDate.substring(5, 7), 10) - 1;
    }
    return new Date().getMonth();
  });

  useEffect(() => {
    if (selectedDate && /^\d{4}-\d{2}-\d{2}/.test(selectedDate)) {
      setViewYear(parseInt(selectedDate.substring(0, 4), 10));
      setViewMonth(parseInt(selectedDate.substring(5, 7), 10) - 1);
    }
  }, [selectedDate]);

  const today = new Date();
  const todayStr = formatYMD(today);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatYMD(yesterday);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDaySelect = (day) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const fullDate = `${viewYear}-${mm}-${dd}`;
    onSelectDate(fullDate);
    setModalVisible(false);
  };

  const handleQuickSelect = (dateStr) => {
    onSelectDate(dateStr);
    setModalVisible(false);
  };

  // Calendar math
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun

  const blankDays = Array.from({ length: firstDayOfWeek });
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Normalize selectedDate for comparison
  const normalizedSelected = selectedDate ? selectedDate.substring(0, 10) : '';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.requiredStar}>*</Text>}
      </Text>

      {/* Trigger Button */}
      <TouchableOpacity
        style={[
          styles.triggerBtn,
          !selectedDate && styles.triggerBtnEmpty,
          disabled && styles.triggerBtnDisabled,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <View style={styles.triggerLeft}>
          {selectedDate ? (
            <>
              <View style={styles.selectedBadge}>
                <Ionicons name="calendar" size={15} color={colors.primary} />
              </View>
              <Text style={styles.selectedText}>{formatDate(selectedDate)}</Text>
            </>
          ) : (
            <>
              <Ionicons name="calendar-outline" size={16} color={colors.textDim} />
              <Text style={styles.placeholderText}>Select Expense Date (Mandatory)...</Text>
            </>
          )}
        </View>

        {disabled ? (
          <View style={styles.disabledBadge}>
            <Ionicons name="lock-closed" size={12} color="#F59E0B" />
            <Text style={styles.disabledBadgeText}>
              {disabledMessage || 'Creator only'}
            </Text>
          </View>
        ) : (
          <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
        )}
      </TouchableOpacity>

      {/* Date Picker Modal */}
      {!disabled && (
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Expense Date</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Quick Select Pills */}
              <View style={styles.quickPillsRow}>
                <TouchableOpacity
                  style={[
                    styles.quickPill,
                    normalizedSelected === todayStr && styles.quickPillActive,
                  ]}
                  onPress={() => handleQuickSelect(todayStr)}
                >
                  <Text
                    style={[
                      styles.quickPillText,
                      normalizedSelected === todayStr && styles.quickPillTextActive,
                    ]}
                  >
                    Today
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.quickPill,
                    normalizedSelected === yesterdayStr && styles.quickPillActive,
                  ]}
                  onPress={() => handleQuickSelect(yesterdayStr)}
                >
                  <Text
                    style={[
                      styles.quickPillText,
                      normalizedSelected === yesterdayStr && styles.quickPillTextActive,
                    ]}
                  >
                    Yesterday
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Month Navigation */}
              <View style={styles.monthNavRow}>
                <TouchableOpacity style={styles.navBtn} onPress={prevMonth}>
                  <Ionicons name="chevron-back" size={16} color={colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.monthLabel}>
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </Text>
                <TouchableOpacity style={styles.navBtn} onPress={nextMonth}>
                  <Ionicons name="chevron-forward" size={16} color={colors.textDark} />
                </TouchableOpacity>
              </View>

              {/* Day Labels (Su, Mo, Tu, We, Th, Fr, Sa) */}
              <View style={styles.daysHeaderRow}>
                {DAY_LABELS.map((d, idx) => (
                  <Text key={idx} style={styles.dayHeaderCell}>
                    {d}
                  </Text>
                ))}
              </View>

              {/* Days Grid */}
              <View style={styles.daysGrid}>
                {blankDays.map((_, idx) => (
                  <View key={`blank-${idx}`} style={styles.dayCellEmpty} />
                ))}

                {monthDays.map((day) => {
                  const mm = String(viewMonth + 1).padStart(2, '0');
                  const dd = String(day).padStart(2, '0');
                  const cellDateStr = `${viewYear}-${mm}-${dd}`;

                  const isSelected = normalizedSelected === cellDateStr;
                  const isToday = cellDateStr === todayStr;

                  return (
                    <TouchableOpacity
                      key={`day-${day}`}
                      style={[
                        styles.dayCell,
                        isSelected && styles.dayCellSelected,
                        isToday && !isSelected && styles.dayCellToday,
                      ]}
                      onPress={() => handleDaySelect(day)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isSelected && styles.dayTextSelected,
                          isToday && !isSelected && styles.dayTextToday,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
