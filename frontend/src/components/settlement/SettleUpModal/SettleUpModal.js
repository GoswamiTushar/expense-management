import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createSettleUpStyles } from './SettleUpModal.styles';
import { useTheme } from '../../../context/ThemeContext';
import { formatCurrency } from '../../../utils/currency';
import { openUpiApp } from '../../../services/upi/upiService';
import { useSwipeDown } from '../../../hooks/useSwipeDown';

const PAYMENT_MODES = [
  { id: 'Cash', label: 'Cash', icon: 'cash-outline' },
  { id: 'UPI', label: 'UPI App', icon: 'flash-outline' },
  { id: 'Bank Transfer', label: 'Bank', icon: 'business-outline' },
  { id: 'Other', label: 'Other', icon: 'ellipsis-horizontal-circle-outline' },
];

export default function SettleUpModal({
  visible,
  onClose,
  onSubmit,
  onUpdate,
  creditor,
  debtor,
  property,
  defaultAmount = 0,
  settlementToEdit = null,
}) {
  const { colors, isDark } = useTheme();
  const tColors = colors;
  const styles = React.useMemo(() => createSettleUpStyles(tColors, isDark), [tColors, isDark]);

  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [launchedUpi, setLaunchedUpi] = useState(false);

  const isEdit = Boolean(settlementToEdit);

  const creditorName = settlementToEdit?.paidToName || creditor?.name || 'Partner';
  const debtorName = settlementToEdit?.settledByName || debtor?.name || 'Partner';
  const creditorId = settlementToEdit?.paidTo || creditor?.id || creditor?._id || '';
  const debtorId = settlementToEdit?.settledBy || debtor?.id || debtor?._id || '';
  const propId = property?.id || property?._id || '';

  const upiId =
    creditor?.upiId ||
    `${creditorName.toLowerCase().replace(/\s+/g, '') || 'manager'}@upi`;

  const slideAnim = useRef(new Animated.Value(600)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleClose = () => {
    if (submitting) return;
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

  const swipeHandlers = useSwipeDown(slideAnim, handleClose, submitting);

  useEffect(() => {
    if (visible) {
      if (settlementToEdit) {
        setAmount(String(settlementToEdit.amount || ''));
        setPaymentMode(settlementToEdit.paymentMode || 'Cash');
        setNotes(settlementToEdit.notes || '');
      } else {
        setAmount(defaultAmount > 0 ? String(defaultAmount) : '');
        setPaymentMode(creditor?.upiId ? 'UPI' : 'Cash');
        setNotes('');
      }
      setSubmitting(false);
      setLaunchedUpi(false);

      slideAnim.setValue(600);
      fadeAnim.setValue(0);
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
  }, [visible, defaultAmount, creditor, settlementToEdit]);

  if (!visible) return null;

  const parsedAmount = parseFloat(amount) || 0;
  const targetDebt = Number(defaultAmount || 0);

  // Helper text calculation
  const renderHelper = () => {
    if (parsedAmount <= 0) return null;

    if (parsedAmount < targetDebt) {
      const remaining = Math.round((targetDebt - parsedAmount) * 100) / 100;
      return (
        <View style={[styles.helperBox, styles.helperPartial]}>
          <Ionicons name="pie-chart-outline" size={14} color={tColors.warning} />
          <Text style={[styles.helperText, { color: tColors.warning }]}>
            Partial payment. Remaining debt to {creditorName} will be {formatCurrency(remaining)}.
          </Text>
        </View>
      );
    }

    if (parsedAmount === targetDebt) {
      return (
        <View style={[styles.helperBox, styles.helperFull]}>
          <Ionicons name="checkmark-circle-outline" size={14} color={tColors.success} />
          <Text style={[styles.helperText, { color: tColors.success }]}>
            Full payment. All pending dues with {creditorName} will clear to ₹0.
          </Text>
        </View>
      );
    }

    // Overpayment case
    const surplus = Math.round((parsedAmount - targetDebt) * 100) / 100;
    return (
      <View style={[styles.helperBox, styles.helperOverpay]}>
        <Ionicons name="swap-horizontal-outline" size={14} color="#60A5FA" />
        <Text style={[styles.helperText, { color: '#60A5FA' }]}>
          Overpayment of {formatCurrency(surplus)}. {creditorName} will now owe you this amount as credit for future expenses.
        </Text>
      </View>
    );
  };

  const handleOpenUpi = () => {
    if (parsedAmount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }
    openUpiApp({
      upiId,
      payeeName: creditorName,
      amount: parsedAmount,
      note: `${property?.name || 'Property'} Settlement`,
    });
    setLaunchedUpi(true);
  };

  const handleRecordSubmit = async () => {
    if (parsedAmount <= 0) {
      alert('Please enter a valid amount greater than ₹0.');
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit) {
        if (onUpdate) {
          await onUpdate(settlementToEdit.id || settlementToEdit._id, {
            amount: parsedAmount,
            paymentMode,
            notes: notes.trim(),
          });
        }
      } else {
        await onSubmit({
          propertyId: propId,
          settledBy: debtorId,
          settledByName: debtorName,
          paidTo: creditorId,
          paidToName: creditorName,
          amount: parsedAmount,
          paymentMode,
          notes: notes.trim(),
        });
      }
      handleClose();
    } catch (err) {
      alert(err.message || (isEdit ? 'Failed to update settlement.' : 'Failed to record settlement.'));
    } finally {
      setSubmitting(false);
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
            {/* Top Drag Handle */}
            <View {...swipeHandlers} style={styles.dragHandle} />

            {/* Header */}
            <View {...swipeHandlers} style={styles.header}>
              <Text style={styles.title}>
                {isEdit ? 'Edit Settlement Request' : 'Record Settlement'}
              </Text>
              <TouchableOpacity onPress={handleClose} disabled={submitting} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={20} color={tColors.textMuted} />
              </TouchableOpacity>
            </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Target Information */}
            <View style={styles.targetBox}>
              <View>
                <Text style={styles.targetLabel}>Paying Partner</Text>
                <Text style={styles.targetName}>{creditorName}</Text>
              </View>
              {targetDebt > 0 && (
                <View style={styles.dueBadge}>
                  <Text style={styles.dueBadgeText}>Owed: {formatCurrency(targetDebt)}</Text>
                </View>
              )}
            </View>

            {/* Amount Field */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={styles.label}>Settlement Amount (₹)</Text>
              {targetDebt > 0 && (
                <View style={styles.presetRow}>
                  <TouchableOpacity
                    style={styles.presetChip}
                    onPress={() => setAmount(String(targetDebt))}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="checkmark-circle-outline" size={12} color={tColors.primary} />
                    <Text style={styles.presetChipText}>Full Due ({formatCurrency(targetDebt)})</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.presetChip}
                    onPress={() => setAmount('')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle-outline" size={12} color={tColors.textMuted} />
                    <Text style={styles.presetChipText}>Clear</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.currencySign}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={tColors.textDim}
                editable={!submitting}
              />
            </View>

            {/* Dynamic Status Helper */}
            {renderHelper()}

            {/* Payment Method Pills */}
            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.modeRow}>
              {PAYMENT_MODES.map((mode) => {
                const isActive = paymentMode === mode.id;
                return (
                  <TouchableOpacity
                    key={mode.id}
                    style={[styles.modePill, isActive && styles.modePillActive]}
                    onPress={() => setPaymentMode(mode.id)}
                    activeOpacity={0.7}
                    disabled={submitting}
                  >
                    <Ionicons
                      name={mode.icon}
                      size={14}
                      color={isActive ? '#FFFFFF' : tColors.textMuted}
                    />
                    <Text style={[styles.modeText, isActive && styles.modeTextActive]}>
                      {mode.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* UPI Details if UPI selected */}
            {paymentMode === 'UPI' && (
              <View style={styles.upiPill}>
                <Ionicons name="card" size={13} color={tColors.info} />
                <Text style={styles.upiText}>Payee UPI: {upiId}</Text>
              </View>
            )}

            {/* Optional Note / Reference */}
            <Text style={styles.label}>Note / Reference (Optional)</Text>
            <View style={styles.noteInputWrap}>
              <TextInput
                style={styles.noteInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g., Handed cash, UPI txn ref #, proof"
                placeholderTextColor={tColors.textDim}
                editable={!submitting}
                maxLength={100}
              />
            </View>

            {/* Mistake Prevention: Detect if user typed numeric amount into note field */}
            {(() => {
              const noteMatch = notes.trim().match(/^₹?\s*(\d+(\.\d+)?)$/);
              const detectedVal = noteMatch ? parseFloat(noteMatch[1]) : null;
              if (detectedVal !== null && detectedVal > 0 && Math.abs(parsedAmount - detectedVal) > 0.01) {
                return (
                  <View style={styles.noteWarningBox}>
                    <Ionicons name="alert-circle" size={16} color={tColors.warning} />
                    <Text style={styles.noteWarningText}>
                      You typed "{notes.trim()}" in Note. Did you mean to set the Settlement Amount to ₹{detectedVal}?
                    </Text>
                    <TouchableOpacity
                      style={styles.noteWarningBtn}
                      onPress={() => {
                        setAmount(String(detectedVal));
                        setNotes('');
                      }}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.noteWarningBtnText}>Set to ₹{detectedVal}</Text>
                    </TouchableOpacity>
                  </View>
                );
              }
              return null;
            })()}

            {/* Action Buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} disabled={submitting}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              {paymentMode === 'UPI' && (
                <TouchableOpacity
                  style={styles.upiAppBtn}
                  onPress={handleOpenUpi}
                  disabled={submitting}
                  activeOpacity={0.8}
                >
                  <Ionicons name="flash" size={14} color={tColors.white} />
                  <Text style={styles.upiAppText}>Open UPI</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.recordBtn, submitting && { opacity: 0.85 }]}
                onPress={handleRecordSubmit}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={tColors.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark-done" size={16} color={tColors.white} />
                    <Text style={styles.recordText}>
                      {isEdit
                        ? `Save Changes (${formatCurrency(parsedAmount)})`
                        : launchedUpi
                        ? `Confirm ${formatCurrency(parsedAmount)}`
                        : parsedAmount > 0
                        ? `Record ${formatCurrency(parsedAmount)}`
                        : 'Record Payment'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.safetyRow}>
              <Ionicons name="shield-checkmark-outline" size={13} color={tColors.textDim} />
              <Text style={styles.safetyNotice}>
                Receiver must confirm receipt before your balance updates.
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </KeyboardAvoidingView>
  </Modal>
);
}
