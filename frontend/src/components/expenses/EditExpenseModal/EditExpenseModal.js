import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { createEditExpenseStyles, styles as defaultStyles } from './EditExpenseModal.styles';
import { useTheme } from '../../../context/ThemeContext';
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
  onDelete,
  onApproveDelete,
  onRejectDelete,
  onCancelDelete,
  currentUser,
  userMap = {},
  property,
}) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createEditExpenseStyles(colors, isDark), [colors, isDark]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState('Wrong or test entry');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Native slide and fade drawer animation
  const slideAnim = useRef(new Animated.Value(600)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && expense) {
      slideAnim.setValue(600);
      fadeAnim.setValue(0);
      setShowDeleteConfirm(false);
      setShowRejectInput(false);
      setDeleteReason('Wrong or test entry');
      setRejectReason('');
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 26,
          mass: 0.9,
          stiffness: 220,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }
  }, [visible, expense]);

  const handleClose = () => {
    if (loading || actionLoading) return;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      onClose();
    });
  };

  // Must be above early-return so hook is called unconditionally
  const swipeHandlers = useSwipeDown(slideAnim, handleClose, loading || actionLoading);

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
  const loggedById = String(expense.loggedBy || '');
  const isCreator = currentUserId === paidById || (loggedById !== '' && currentUserId === loggedById);
  const isAdmin = currentUser?.role === 'admin';

  const rawPayer =
    expense.payerName && expense.payerName !== 'Manager'
      ? expense.payerName
      : userMap[expense.paidBy]?.name || expense.payerName || 'Member';
  const payerName = rawPayer || 'Member';

  const rawLogger =
    expense.loggedByName && expense.loggedByName !== 'Manager'
      ? expense.loggedByName
      : userMap[expense.loggedBy]?.name || expense.loggedByName;
  const loggerName = rawLogger || 'Partner';

  const isLoggedOnBehalf = Boolean(
    expense.loggedBy &&
    expense.paidBy &&
    String(expense.loggedBy) !== String(expense.paidBy)
  );

  const getExpenseAgeMinutes = (exp) => {
    let createdMs = 0;
    const createdRaw = exp.createdAt || exp.date;
    if (createdRaw) {
      const ms = new Date(createdRaw).getTime();
      if (!isNaN(ms)) createdMs = ms;
    }
    if (!createdMs && typeof exp._id === 'string' && exp._id.startsWith('exp_')) {
      const part = parseInt(exp._id.split('_')[1], 10);
      if (!isNaN(part)) createdMs = part;
    }
    if (!createdMs && typeof exp.id === 'string' && exp.id.startsWith('exp_')) {
      const part = parseInt(exp.id.split('_')[1], 10);
      if (!isNaN(part)) createdMs = part;
    }
    if (!createdMs) return 9999;
    return (Date.now() - createdMs) / 60000;
  };

  const ageMinutes = getExpenseAgeMinutes(expense);
  const isUnder5Mins = ageMinutes <= 5.0;

  const propManagers = (property?.managers || []).map((m) => String(m.id || m._id || m));
  const otherManagers = propManagers.filter((m) => m !== currentUserId);
  const hasOtherManagers = otherManagers.length > 0;
  const isDirectDeleteEligible = isUnder5Mins || isAdmin || !hasOtherManagers;

  const isPendingDelete = expense.deleteStatus === 'pending_approval';
  const isDeleteRequester = String(expense.deleteRequestedBy || '') === currentUserId;
  const isCoManager = !isCreator && (propManagers.includes(currentUserId) || isAdmin);

  const handleDeleteSubmit = async () => {
    if (!onDelete) return;
    setActionLoading(true);
    try {
      const res = await onDelete(expense._id || expense.id, deleteReason.trim() || 'Wrong or test entry');
      if (res?.status === 'deleted') {
        handleClose();
      } else {
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to process deletion.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveDelete = async () => {
    if (!onApproveDelete) return;
    setActionLoading(true);
    try {
      await onApproveDelete(expense._id || expense.id);
      handleClose();
    } catch (err) {
      alert(err.message || 'Failed to approve deletion.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectDelete = async () => {
    if (!onRejectDelete) return;
    setActionLoading(true);
    try {
      await onRejectDelete(expense._id || expense.id, rejectReason.trim() || 'Rejected by co-manager');
      setShowRejectInput(false);
    } catch (err) {
      alert(err.message || 'Failed to reject deletion.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelDelete = async () => {
    if (!onCancelDelete) return;
    setActionLoading(true);
    try {
      await onCancelDelete(expense._id || expense.id);
    } catch (err) {
      alert(err.message || 'Failed to cancel deletion request.');
    } finally {
      setActionLoading(false);
    }
  };

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
                  {isLoggedOnBehalf
                    ? `Logged by ${loggerName} for ${payerName}`
                    : `Paid by ${payerName}`} • {formatDateTime(expense.createdAt || expense.date)}
                </Text>
              </View>
              <View style={styles.headerRightActions}>
                {(isCreator || isAdmin) && !isPendingDelete && (
                  <TouchableOpacity
                    style={styles.deleteIconBtn}
                    onPress={() => setShowDeleteConfirm((prev) => !prev)}
                    disabled={loading || actionLoading}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Delete Expense"
                  >
                    <Ionicons name="trash-outline" size={17} color="#EF4444" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleClose} disabled={loading || actionLoading} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={22} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              {/* Pending Deletion Review Banner */}
              {isPendingDelete && (
                <View style={styles.bannerAmber}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Ionicons name="time" size={16} color={isDark ? '#FBBF24' : '#D97706'} />
                    <Text style={styles.bannerTitle}>Deletion Approval Pending</Text>
                  </View>
                  <Text style={styles.bannerText}>
                    {isDeleteRequester
                      ? `You requested to delete this expense (${expense.deleteReason || 'Wrong or test entry'}). Waiting for approval from other group members.`
                      : `${expense.deleteRequestedByName || 'A member'} requested to delete this expense (${expense.deleteReason || 'Wrong or test entry'}). Approve or reject this request below.`
                    }
                  </Text>

                  {isDeleteRequester ? (
                    <View style={{ marginTop: 10 }}>
                      <TouchableOpacity
                        style={[styles.actionBtnFlex, styles.btnCancel]}
                        onPress={handleCancelDelete}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <ActivityIndicator size="small" color={colors.textDark} />
                        ) : (
                          <Text style={styles.actionBtnCancelText}>Cancel Deletion Request</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : isCoManager ? (
                    <View style={[styles.actionsRow, { marginTop: 10 }]}>
                      <TouchableOpacity
                        style={[styles.actionBtnFlex, styles.btnDanger]}
                        onPress={handleApproveDelete}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <>
                            <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" />
                            <Text style={styles.actionBtnText}>Approve &amp; Delete</Text>
                          </>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtnFlex, styles.btnCancel]}
                        onPress={() => setShowRejectInput((prev) => !prev)}
                        disabled={actionLoading}
                      >
                        <Ionicons name="close-circle-outline" size={16} color={colors.textMuted} />
                        <Text style={styles.actionBtnCancelText}>Reject...</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  {showRejectInput && (
                    <View style={{ marginTop: 10 }}>
                      <TextInput
                        style={styles.reasonInput}
                        placeholder="Reason for rejecting (optional)"
                        placeholderTextColor={colors.textDim}
                        value={rejectReason}
                        onChangeText={setRejectReason}
                      />
                      <TouchableOpacity
                        style={[styles.actionBtnFlex, styles.btnDanger, { paddingVertical: 8 }]}
                        onPress={handleRejectDelete}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <Text style={styles.actionBtnText}>Confirm Rejection</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {/* Delete Confirmation / Approval Request Box */}
              {showDeleteConfirm && !isPendingDelete && (
                <View style={styles.deleteCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Ionicons name="alert-circle" size={18} color="#DC2626" />
                    <Text style={styles.deleteCardTitle}>
                      {isDirectDeleteEligible ? 'Delete Expense Directly' : 'Request Deletion Approval'}
                    </Text>
                  </View>
                  <Text style={styles.deleteCardDesc}>
                    {isDirectDeleteEligible
                      ? 'This expense was logged less than 5 minutes ago (or you are the sole member / admin). You can delete it directly. It will be immediately removed from the ledger and balances.'
                      : 'This expense was logged over 5 minutes ago. To prevent discrepancies, deletion requires approval from other group members.'
                    }
                  </Text>

                  <Text style={[styles.sectionLabel, { marginTop: 4, marginBottom: 4 }]}>REASON FOR DELETION</Text>
                  <TextInput
                    style={styles.reasonInput}
                    placeholder="e.g. Test entry, wrong amount, duplicate"
                    placeholderTextColor={colors.textDim}
                    value={deleteReason}
                    onChangeText={setDeleteReason}
                  />

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={[styles.actionBtnFlex, styles.btnCancel]}
                      onPress={() => setShowDeleteConfirm(false)}
                      disabled={actionLoading}
                    >
                      <Text style={styles.actionBtnCancelText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionBtnFlex,
                        isDirectDeleteEligible ? styles.btnDanger : styles.btnAmber,
                      ]}
                      onPress={handleDeleteSubmit}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <>
                          <Ionicons
                            name={isDirectDeleteEligible ? 'trash' : 'paper-plane'}
                            size={15}
                            color="#FFF"
                          />
                          <Text style={styles.actionBtnText}>
                            {isDirectDeleteEligible ? 'Delete Now' : 'Send Approval Request'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Full untruncated Title Input */}
              <Text style={styles.sectionLabel}>EXPENSE TITLE / NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Expense title"
                placeholderTextColor={colors.textDim}
                value={title}
                onChangeText={setTitle}
                editable={!loading && !isPendingDelete}
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
                disabled={!isCreator || isPendingDelete}
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
                    editable={!loading && !isPendingDelete}
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
                    editable={!loading && !isPendingDelete}
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
              {isPendingDelete ? (
                <View style={[styles.submitBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', shadowOpacity: 0 }]}>
                  <Text style={[styles.submitText, { color: colors.textMuted }]}>Cannot Edit While Deletion is Pending</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.submitBtn, loading && { opacity: 0.85 }]}
                  onPress={handleSave}
                  disabled={loading || actionLoading}
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
              )}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
