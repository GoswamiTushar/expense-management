import React, { useRef, useEffect } from 'react';
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
import { styles } from './AddExpenseModal.styles';
import { colors } from '../../../theme/colors';
import { formatCurrency } from '../../../utils/currency';
import { useExpenseForm } from '../../../hooks/useExpenseForm';
import CategoryPickerField from './CategoryPickerField';
import ImagePickerField from './ImagePickerField';
import MemberChecklist from './MemberChecklist';

export default function AddExpenseModal({ visible, onClose, onSubmit, property, currentUser }) {
  const slideAnim = useRef(new Animated.Value(600)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleClose = () => {
    if (form.submitting) return;
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

  const form = useExpenseForm(property, currentUser, onSubmit, handleClose);

  useEffect(() => {
    if (visible) {
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
  }, [visible]);

  if (!visible) return null;

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
            {/* Native Drag Pill Indicator */}
            <View style={styles.dragHandle} />

            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Log Airbnb Expense</Text>
                <Text style={styles.sub}>{property?.name || 'Property'}</Text>
              </View>
              <TouchableOpacity onPress={handleClose} disabled={form.submitting} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
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
            <Text style={styles.label}>TOPIC / TITLE</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Monthly Rent, Electricity Bill"
              placeholderTextColor={colors.textDim}
              value={form.title}
              onChangeText={form.setTitle}
              editable={!form.submitting}
            />
            <CategoryPickerField
              selectedCategory={form.category}
              onSelectCategory={form.setCategory}
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
              onPress={form.handleSubmit}
              disabled={form.submitting}
              activeOpacity={0.8}
            >
              {form.submitting ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <ActivityIndicator size="small" color={colors.white} />
                  <Text style={styles.submitText}>Saving Expense to Cloud...</Text>
                </View>
              ) : (
                <Text style={styles.submitText}>
                  Log & Notify ({formatCurrency(form.parsedAmount)})
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
