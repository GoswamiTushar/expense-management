import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../styles/app.styles';
import { colors } from '../../theme/colors';
import Header from '../common/Header/Header';
import AppModals from '../common/AppModals/AppModals';
import DashboardContent from './DashboardContent';
import { createExpense, updateExpense } from '../../services/api/expenseApi';
import { createSettlement } from '../../services/api/settlementApi';
import { createProperty } from '../../services/api/propertyApi';
import { updateProfile } from '../../services/api/authApi';
import {
  sendExpensePushNotification,
  sendExpenseEditNotification,
  sendSettlementPushNotification,
} from '../../services/notifications/pushService';

export default function MainDashboard({ data, onLogout }) {
  const [cat, setCat] = useState('ALL');
  const [settleWith, setSettleWith] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const setM = (k) => setActiveModal(k || null);

  const onAddExpense = async (exp) => {
    const res = await createExpense(exp);
    data.setExpenses((p) => [res, ...p]);
    const coManagers = (data.activeProperty?.managerDetails || []).filter(
      (m) => String(m.id) !== String(data.currentUser?._id)
    );
    sendExpensePushNotification({
      property: data.activeProperty,
      payerName: data.currentUser?.name,
      title: exp.title,
      amount: exp.amount,
      shareAmount: exp.sharePerPerson,
      recipients: coManagers,
    });
    data.refresh();
  };

  const onUpdateExpense = async (expenseId, payload) => {
    const updated = await updateExpense(expenseId, payload, data.activeProperty?.id || data.activeProperty?._id);
    data.setExpenses((prev) =>
      prev.map((item) => (item.id === expenseId || item._id === expenseId ? updated : item))
    );
    setSelectedExpense(updated);

    const changeParts = [];
    if (payload.category) changeParts.push(`category to '${payload.category}'`);
    if (payload.title) changeParts.push('title');
    if (payload.amount) changeParts.push(`amount to ₹${payload.amount}`);

    const coManagers = (data.activeProperty?.managerDetails || []).filter(
      (m) => String(m.id) !== String(data.currentUser?._id)
    );
    sendExpenseEditNotification({
      property: data.activeProperty,
      editorName: data.currentUser?.name,
      title: updated.title,
      summary: changeParts.join(', ') || 'details',
      recipients: coManagers,
    });

    data.refresh();
    return updated;
  };

  const onSettle = async (s) => {
    const res = await createSettlement(s);
    data.setSettlements((p) => [res, ...p]);
    const coManagers = (data.activeProperty?.managerDetails || []).filter(
      (m) => String(m.id) !== String(data.currentUser?._id)
    );
    sendSettlementPushNotification({
      property: data.activeProperty,
      debtorName: data.currentUser?.name,
      creditorName: settleWith?.user?.name,
      amount: s.amount,
      recipients: coManagers,
    });
    data.refresh();
  };

  const onCreateProp = async (p) => {
    const n = await createProperty(p);
    data.setProperties((prev) => [n, ...prev]);
    data.setActiveProperty(n);
  };

  return (
    <View style={styles.container}>
      <Header
        activeProperty={data.activeProperty}
        currentUser={data.currentUser}
        unreadCount={data.unreadCount || 0}
        onOpenPropertyPicker={() => setM('showPropPicker')}
        onOpenNotifications={() => setM('showNotifs')}
        onOpenAuditLog={() => setM('showAudit')}
        onOpenProfile={() => setM('showProfile')}
        onOpenInvitePartner={() => setM('showInvitePartner')}
      />
      <DashboardContent
        data={data}
        cat={cat}
        setCat={setCat}
        setM={setM}
        setSettleWith={setSettleWith}
        onSelectExpense={(exp) => {
          setSelectedExpense(exp);
          setM('showEditExpense');
        }}
      />
      {data.activeProperty && (
        <TouchableOpacity style={styles.fab} onPress={() => setM('showAdd')}>
          <Ionicons name="add" size={24} color={colors.white} />
          <Text style={styles.fabText}>Add Expense</Text>
        </TouchableOpacity>
      )}
      <AppModals
        activeModal={activeModal}
        setM={setM}
        data={data}
        settleWith={settleWith}
        selectedExpense={selectedExpense}
        notifications={data.notifications || []}
        onMarkNotificationsRead={data.markNotificationsAsRead}
        onAddExpense={onAddExpense}
        onUpdateExpense={onUpdateExpense}
        onSettle={onSettle}
        onCreateProperty={onCreateProp}
        onSaveProfile={async (p) => {
          try {
            const updated = await updateProfile({ name: p.name, upiId: p.upiId });
            data.setCurrentUser(updated);
          } catch (err) {
            alert('Failed to save profile: ' + (err.message || 'Unknown error'));
          }
        }}
        onLogout={onLogout}
        onInviteSuccess={data.reload}
        onAcceptInviteSuccess={(r) => {
          data.setCurrentUser(r.user);
          data.reload();
        }}
      />
    </View>
  );
}
