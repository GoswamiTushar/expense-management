import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Easing,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './EditExpenseModal.styles';
import { colors } from '../../../theme/colors';
import { formatCurrency } from '../../../utils/currency';
import { formatDateTime } from '../../../utils/date';
import CategoryPickerField from '../AddExpenseModal/CategoryPickerField';
import DatePickerField from '../AddExpenseModal/DatePickerField';
import { useSwipeDown } from '../../../hooks/useSwipeDown';

export default function EditExpenseModal({
  visible,
  expense,
  onClose,
  onSave,
  currentUser,
  userMap = {},
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Native slide and fade drawer animation
  const slideAnim = useRef(new Animated.Value(600)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && expense) {
      slideAnim.setValue(600);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 26,
          mass: 0.9,
          stiffness: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, expense]);

  const handleClose = () => {
    if (loading) return;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  // Must be above early-return so hook is called unconditionally
  const swipeHandlers = useSwipeDown(slideAnim, handleClose, loading);

  useEffect(() => {
    if (expense) {
      setTitle(expense.title || '');
      setCategory(expense.category || '');
      setDate(expense.date || expense.createdAt || '');
      setAmount(String(expense.amount || ''));
      setNotes(expense.notes || '');
      setLoading(false);
    }
  }, [expense]);

  if (!visible || !expense) return null;

  const currentUserId = String(currentUser?._id || currentUser?.id || '');
  const paidById = String(expense.paidBy || '');
  const isCreator = currentUserId === paidById;

  const rawPayer =
    expense.payerName && expense.payerName !== 'Manager'
      ? expense.payerName
      : userMap[expense.paidBy]?.name || expense.payerName || 'Manager';
  const payerName = rawPayer || 'Manager';

  // Audit log list: use existing or fallback to initial creation entry
  const auditEntries = (expense.auditLog && expense.auditLog.length > 0)
    ? expense.auditLog
    : [
        {
          action: 'Created expense',
          actorName: payerName,
          timestamp: expense.createdAt || expense.date,
        },
      ];

  const handleSave = async () => {
    if (!title.trim()) return alert('Please enter an expense title.');
    if (!category.trim()) return alert('Please select a category.');

    const parsedAmount = parseFloat(amount);
    if (isCreator && (isNaN(parsedAmount) || parsedAmount <= 0)) {
      return alert('Please enter a valid amount.');
    }
    if (isCreator && (!date || !date.trim())) {
      return alert('Please select a valid expense date.');
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        category: category.trim(),
      };
      // Only the creator can edit amount, date, and notes
      if (isCreator) {
        payload.notes = notes.trim();
        if (parsedAmount !== expense.amount) {
          payload.amount = parsedAmount;
        }
        if (date.trim() && date.trim() !== (expense.date || '').trim()) {
          payload.date = date.trim();
        }
      }
      await onSave(expense._id || expense.id, payload);
      handleClose();
    } catch (err) {
      alert(err.message || 'Failed to update expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={true} transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>

          <Animated.View
            style={[
              styles.sheet,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Native Drawer Drag Indicator */}
            <View {...swipeHandlers} style={[styles.dragHandle, { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: 8 }]} />

            {/* Header */}
            <View {...swipeHandlers} style={styles.header}>
              <View style={styles.titleBox}>
                <Text style={styles.modalTitle}>Expense Details &amp; Edit</Text>
                <Text style={styles.modalSub}>
                  Logged by {payerName} • {formatDateTime(expense.createdAt || expense.date)}
                </Text>
              </View>
              <TouchableOpacity onPress={handleClose} disabled={loading} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              {/* Full untruncated Title Input */}
              <Text style={styles.sectionLabel}>EXPENSE TITLE / NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Expense title"
                placeholderTextColor={colors.textDim}
                value={title}
                onChangeText={setTitle}
                editable={!loading}
                multiline
              />

              {/* Category Searchable Dropdown (Editable by all managers) */}
              <CategoryPickerField
                selectedCategory={category}
                onSelectCategory={setCategory}
                label="CATEGORY (ALL MANAGERS CAN EDIT)"
                required={true}
              />

              {/* Expense Date (Editable ONLY by creator) */}
              <DatePickerField
                selectedDate={date}
                onSelectDate={setDate}
                disabled={!isCreator}
                disabledMessage={`Only ${payerName} can edit date`}
                label={isCreator ? "EXPENSE DATE (CREATOR CAN EDIT)" : "EXPENSE DATE"}
                required={true}
              />

              {/* Cost / Amount (Editable ONLY by creator) */}
              <Text style={styles.sectionLabel}>AMOUNT (₹)</Text>
              {isCreator ? (
                <View style={styles.amountRow}>
                  <Text style={styles.currency}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0"
                    placeholderTextColor={colors.textDim}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    editable={!loading}
                  />
                </View>
              ) : (
                <View style={styles.disabledInputBox}>
                  <Text style={styles.disabledInputText}>{formatCurrency(expense.amount)}</Text>
                  <View style={styles.lockedBadge}>
                    <Ionicons name="lock-closed" size={12} color="#F59E0B" />
                    <Text style={styles.lockedBadgeText}>Only {payerName} can edit cost</Text>
                  </View>
                </View>
              )}

              {/* Split and Share Summary */}
              <View style={styles.metaCard}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaKey}>Split Between:</Text>
                  <Text style={styles.metaVal}>{expense.splitAmong?.length || 1} managers</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaKey}>Per-Person Share:</Text>
                  <Text style={styles.metaVal}>{formatCurrency(expense.sharePerPerson)}</Text>
                </View>
              </View>

              {/* Notes (ONLY visible & editable by the creator) */}
              {isCreator && (
                <>
                  <Text style={styles.sectionLabel}>NOTES (OPTIONAL)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Optional notes or UPI reference"
                    placeholderTextColor={colors.textDim}
                    value={notes}
                    onChangeText={setNotes}
                    editable={!loading}
                  />
                </>
              )}

              {/* In-Modal Audit Log Section */}
              <View style={styles.auditSection}>
                <View style={styles.auditHeader}>
                  <Ionicons name="time-outline" size={15} color={colors.primary} />
                  <Text style={styles.auditTitle}>Audit Log &amp; Edit History</Text>
                </View>
                <ScrollView style={styles.auditList} nestedScrollEnabled>
                  {auditEntries.map((item, idx) => (
                    <View key={idx} style={styles.auditItem}>
                      <View style={styles.auditItemTop}>
                        <Text style={styles.auditActor}>{item.actorName || 'Manager'}</Text>
                        <Text style={styles.auditTime}>{formatDateTime(item.timestamp)}</Text>
                      </View>
                      <Text style={styles.auditAction}>{item.action}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.submitBtn, loading && { opacity: 0.85 }]}
                onPress={handleSave}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color={colors.white} />
                    <Text style={styles.submitText}>Saving Changes...</Text>
                  </View>
                ) : (
                  <Text style={styles.submitText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
