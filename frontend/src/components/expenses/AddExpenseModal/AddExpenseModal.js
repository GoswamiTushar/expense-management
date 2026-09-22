import React from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './AddExpenseModal.styles';
import { colors } from '../../../theme/colors';
import { formatCurrency } from '../../../utils/currency';
import { useExpenseForm } from '../../../hooks/useExpenseForm';
import CategoryPickerField from './CategoryPickerField';
import ImagePickerField from './ImagePickerField';
import MemberChecklist from './MemberChecklist';

export default function AddExpenseModal({ visible, onClose, onSubmit, property, currentUser }) {
  const form = useExpenseForm(property, currentUser, onSubmit, onClose);

  if (!visible) return null;

  return (
    <Modal visible={true} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View><Text style={styles.title}>Log Airbnb Expense</Text><Text style={styles.sub}>{property?.name || 'Property'}</Text></View>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={20} color={colors.textMuted} /></TouchableOpacity>
          </View>
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>AMOUNT</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currency}>₹</Text>
              <TextInput style={styles.amountInput} placeholder="0" placeholderTextColor={colors.textDim} keyboardType="numeric" value={form.amount} onChangeText={form.setAmount} />
            </View>
            <Text style={styles.label}>TOPIC / TITLE</Text>
            <TextInput style={styles.input} placeholder="e.g. Monthly Rent, Electricity Bill" placeholderTextColor={colors.textDim} value={form.title} onChangeText={form.setTitle} />
            <CategoryPickerField selectedCategory={form.category} onSelectCategory={form.setCategory} />
            <Text style={styles.label}>SPLIT EQUALLY AMONG</Text>
            <MemberChecklist managers={property?.managers || []} managerDetails={property?.managerDetails || []} currentUser={currentUser} selectedMembers={form.selectedMembers} sharePerPerson={form.sharePerPerson} onToggle={form.toggleMember} />
            <ImagePickerField receiptUrl={form.receiptUrl} onSelectReceipt={form.setReceiptUrl} />
            <Text style={styles.label}>NOTES (OPTIONAL)</Text>
            <TextInput style={styles.input} placeholder="e.g. UPI Ref # or notes" placeholderTextColor={colors.textDim} value={form.notes} onChangeText={form.setNotes} />
            <TouchableOpacity style={styles.submitBtn} onPress={form.handleSubmit} activeOpacity={0.8}>
              <Text style={styles.submitText}>Log & Notify ({formatCurrency(form.parsedAmount)})</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
