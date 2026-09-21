import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './SettleUpModal.styles';
import { colors } from '../../../theme/colors';
import { formatCurrency } from '../../../utils/currency';
import { openUpiApp } from '../../../services/upi/upiService';

export default function SettleUpModal({ visible, onClose, onSubmit, creditor, debtor, property, defaultAmount = 0 }) {
  const [launched, setLaunched] = useState(false);
  const upiId = creditor?.upiId || `${creditor?.name?.toLowerCase().replace(/\s+/g, '') || 'manager'}@upi`;

  useEffect(() => { if (visible) setLaunched(false); }, [visible]);

  const handlePayUpi = () => {
    openUpiApp({ upiId, payeeName: creditor?.name || 'Partner', amount: defaultAmount, note: `${property?.name || 'Airbnb'} Payment` });
    setLaunched(true);
  };

  const handleComplete = () => {
    onSubmit({ propertyId: property?._id, settledBy: debtor?._id, settledByName: debtor?.name || 'Partner', paidTo: creditor?._id, paidToName: creditor?.name || 'Partner', amount: defaultAmount, paymentMode: 'UPI App' });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}><Text style={styles.title}>Pay Partner</Text><TouchableOpacity onPress={onClose}><Ionicons name="close" size={20} color={colors.textMuted} /></TouchableOpacity></View>
          <View style={styles.promptBox}>
            <Text style={styles.promptText}>Pay <Text style={styles.amountHighlight}>{formatCurrency(defaultAmount)}</Text> to <Text style={styles.partnerHighlight}>{creditor?.name || 'Partner'}</Text>?</Text>
            <View style={styles.upiPill}><Ionicons name="card" size={13} color="#38BDF8" /><Text style={styles.upiText}>UPI ID: {upiId}</Text></View>
          </View>
          {!launched ? (
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.payBtn} onPress={handlePayUpi} activeOpacity={0.8}><Ionicons name="flash" size={15} color={colors.white} /><Text style={styles.payText}>Pay via UPI App</Text></TouchableOpacity>
            </View>
          ) : (
            <View style={styles.doneBox}>
              <Text style={styles.donePrompt}>UPI App opened. After completing payment:</Text>
              <TouchableOpacity style={styles.settleBtn} onPress={handleComplete} activeOpacity={0.8}><Ionicons name="checkmark-done" size={17} color={colors.white} /><Text style={styles.settleText}>Mark as Settled (Reset to ₹0)</Text></TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
