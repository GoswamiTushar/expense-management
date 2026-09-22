import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../styles/app.styles';
import { colors } from '../../theme/colors';
import Header from '../common/Header/Header';
import AppModals from '../common/AppModals/AppModals';
import DashboardContent from './DashboardContent';
import { createExpense } from '../../services/api/expenseApi';
import { createSettlement } from '../../services/api/settlementApi';
import { createProperty } from '../../services/api/propertyApi';
import { saveDeviceUserProfile } from '../../services/storage/sessionStore';
import { sendExpensePushNotification, sendSettlementPushNotification } from '../../services/notifications/pushService';

export default function MainDashboard({ data, onLogout }) {
  const [cat, setCat] = useState('ALL');
  const [settleWith, setSettleWith] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const setM = (k) => setActiveModal(k || null);

  const onAddExpense = async (exp) => {
    const res = await createExpense(exp); data.setExpenses((p) => [res, ...p]);
    sendExpensePushNotification({ property: data.activeProperty, payerName: data.currentUser?.name, title: exp.title, amount: exp.amount, shareAmount: exp.sharePerPerson });
  };
  const onSettle = async (s) => {
    const res = await createSettlement(s); data.setSettlements((p) => [res, ...p]);
    sendSettlementPushNotification({ property: data.activeProperty, debtorName: data.currentUser?.name, creditorName: settleWith?.user?.name, amount: s.amount });
  };
  const onCreateProp = async (p) => {
    const n = await createProperty(p); data.setProperties((prev) => [n, ...prev]); data.setActiveProperty(n);
  };

  return (
    <View style={styles.container}>
      <Header activeProperty={data.activeProperty} currentUser={data.currentUser} onOpenPropertyPicker={() => setM('showPropPicker')} onOpenNotifications={() => setM('showNotifs')} onOpenAuditLog={() => setM('showAudit')} onOpenProfile={() => setM('showProfile')} onOpenInvitePartner={() => setM('showInvitePartner')} />
      <DashboardContent data={data} cat={cat} setCat={setCat} setM={setM} setSettleWith={setSettleWith} />
      {data.activeProperty && (
        <TouchableOpacity style={styles.fab} onPress={() => setM('showAdd')}><Ionicons name="add" size={24} color={colors.white} /><Text style={styles.fabText}>Add Expense</Text></TouchableOpacity>
      )}
      <AppModals activeModal={activeModal} setM={setM} data={data} settleWith={settleWith} onAddExpense={onAddExpense} onSettle={onSettle} onCreateProperty={onCreateProp} onSaveProfile={async (p) => { const s = await saveDeviceUserProfile(p); data.setCurrentUser(s); }} onLogout={onLogout} onInviteSuccess={data.reload} onAcceptInviteSuccess={(r) => { data.setCurrentUser(r.user); data.reload(); }} />
    </View>
  );
}
