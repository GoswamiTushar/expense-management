import React, { useRef, useEffect, useMemo, useState } from 'react';
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
import { createAddExpenseStyles, styles as defaultStyles } from './AddExpenseModal.styles';
import { useTheme } from '../../../context/ThemeContext';
import { formatCurrency } from '../../../utils/currency';
import { useExpenseForm } from '../../../hooks/useExpenseForm';
import { useSwipeDown } from '../../../hooks/useSwipeDown';
import CategoryPickerField from './CategoryPickerField';
import DatePickerField from './DatePickerField';
import ImagePickerField from './ImagePickerField';
import MemberChecklist from './MemberChecklist';
import PayerPickerField from './PayerPickerField';
import { suggestCategoryFromTitle } from '../../../theme/categories';

export default function AddExpenseModal({ visible, onClose, onSubmit, property, currentUser }) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createAddExpenseStyles(colors, isDark), [colors, isDark]);
  const slideAnim = useRef(new Animated.Value(600)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showBehalfWarning, setShowBehalfWarning] = useState(false);

  const handleClose = () => {
    if (form.submitting) return;
    setShowBehalfWarning(false);
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

  const scrollOffset = useRef(0);
  const form = useExpenseForm(property, currentUser, onSubmit, handleClose, visible);
  const swipeHandlers = useSwipeDown(slideAnim, handleClose, {
    disabled: form.submitting,
    isAtTop: () => scrollOffset.current <= 5,
  });
  const suggestedCategory = useMemo(() => suggestCategoryFromTitle(form.title), [form.title]);

  useEffect(() => {
    if (visible) {
      setShowBehalfWarning(false);
      scrollOffset.current = 0;
      slideAnim.setValue(600);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 26,
          mass: 0.8,
          stiffness: 280,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();

    }
  }, [visible]);

  if (!visible) return null;

  const currentUserId = String(currentUser?._id || currentUser?.id || '');
  const selectedPayerId = String(form.paidBy || currentUserId);
  const isOnBehalf = selectedPayerId !== currentUserId;

  const handleFormSubmitPress = () => {
    if (!form.title.trim() || form.parsedAmount <= 0) return alert('Enter a title and valid amount.');
    if (!form.category || !form.category.trim()) return alert('Please select an expense category.');
    if (!form.date || !form.date.trim()) return alert('Please select the expense date.');

    if (isOnBehalf) {
      setShowBehalfWarning(true);
    } else {
      form.executeSubmit();
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
            {...swipeHandlers}
            style={[
              styles.sheet,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Native Drag Pill — also swipeable */}
            <View style={[styles.dragHandle, { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: 8 }]} />

            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Log Expense</Text>
                <Text style={styles.sub}>{property?.name || 'Group / Property'}</Text>
              </View>
              <TouchableOpacity onPress={handleClose} disabled={form.submitting} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.body}
              showsVerticalScrollIndicator={false}
              onScroll={(e) => {
                scrollOffset.current = e.nativeEvent.contentOffset.y;
              }}
              scrollEventThrottle={16}
            >
              <PayerPickerField
                managers={property?.managers || []}
                managerDetails={property?.managerDetails || []}
                currentUser={currentUser}
                selectedPayerId={form.paidBy}
                onSelectPayer={form.setPayer}
              />

              <Text style={styles.label}>AMOUNT</Text>
              <View style={styles.amountRow}>
                <Text style={styles.currency}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor={colors.textDim}
                  keyboardType="numeric"
                  value={form.amount}
                  onChangeText={form.setAmount}
                  editable={!form.submitting}
                />
              </View>

              <Text style={styles.label}>TITLE / DESCRIPTION</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Dinner, Fuel, Groceries, Electricity"
                placeholderTextColor={colors.textDim}
                value={form.title}
                onChangeText={form.setTitle}
                editable={!form.submitting}
              />

              <CategoryPickerField
                selectedCategory={form.category}
                onSelectCategory={form.setCategory}
                suggestedCategory={suggestedCategory}
              />

              <DatePickerField
                selectedDate={form.date}
                onSelectDate={form.setDate}
              />

              <Text style={styles.label}>SPLIT EQUALLY AMONG</Text>
              <MemberChecklist
                managers={property?.managers || []}
                managerDetails={property?.managerDetails || []}
                currentUser={currentUser}
                selectedMembers={form.selectedMembers}
                sharePerPerson={form.sharePerPerson}
                onToggle={form.toggleMember}
              />

              <ImagePickerField
                receiptUrls={form.receiptUrls}
                addReceiptUrls={form.addReceiptUrls}
                removeReceiptUrl={form.removeReceiptUrl}
              />

              <Text style={styles.label}>NOTES (OPTIONAL)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. UPI Ref # or notes"
                placeholderTextColor={colors.textDim}
                value={form.notes}
                onChangeText={form.setNotes}
                editable={!form.submitting}
              />

              <TouchableOpacity
                style={[styles.submitBtn, form.submitting && { opacity: 0.85 }]}
                onPress={handleFormSubmitPress}
                disabled={form.submitting}
                activeOpacity={0.8}
              >
                {form.submitting ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color={colors.white} />
                    <Text style={styles.submitText}>Saving Expense...</Text>
                  </View>
                ) : (
                  <Text style={styles.submitText}>
                    Save Expense ({formatCurrency(form.parsedAmount)})
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </Animated.View>

        {/* Confirmatory Warning when logging on behalf of another user */}
        {showBehalfWarning && (
          <Modal visible={true} transparent animationType="fade">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 9999 }}>
              <View
                style={{
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderRadius: 20,
                  padding: 24,
                  width: '100%',
                  maxWidth: 360,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.35,
                  shadowRadius: 20,
                  elevation: 15,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.16)' : '#FEF3C7',
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignSelf: 'center',
                    marginBottom: 14,
                  }}
                >
                  <Ionicons name="alert" size={26} color="#F59E0B" />
                </View>

                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: '700',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    textAlign: 'center',
                    marginBottom: 8,
                  }}
                >
                  Confirm Logging on Behalf
                </Text>

                <Text
                  style={{
                    fontSize: 13.5,
                    color: isDark ? '#94A3B8' : '#64748B',
                    textAlign: 'center',
                    lineHeight: 20,
                    marginBottom: 20,
                  }}
                >
                  You are logging this expense on behalf of{' '}
                  <Text style={{ fontWeight: '700', color: isDark ? '#F8FAFC' : '#0F172A' }}>
                    {form.payerName}
                  </Text>
                  . Are you sure?
                </Text>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: isDark ? '#334155' : '#E2E8F0',
                      alignItems: 'center',
                    }}
                    onPress={() => setShowBehalfWarning(false)}
                    disabled={form.submitting}
                  >
                    <Text
                      style={{
                        fontSize: 13.5,
                        fontWeight: '600',
                        color: isDark ? '#E2E8F0' : '#475569',
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: '#6366F1',
                      alignItems: 'center',
                    }}
                    onPress={async () => {
                      setShowBehalfWarning(false);
                      await form.executeSubmit();
                    }}
                    disabled={form.submitting}
                  >
                    <Text
                      style={{
                        fontSize: 13.5,
                        fontWeight: '700',
                        color: '#FFFFFF',
                      }}
                    >
                      Yes, Log Expense
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}
