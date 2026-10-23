import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, Animated, Easing, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createAppStyles } from '../../styles/app.styles';
import { useTheme } from '../../context/ThemeContext';
import Header from '../common/Header/Header';
import BottomNav from '../common/BottomNav/BottomNav';
import AppModals from '../common/AppModals/AppModals';
import DashboardContent from './DashboardContent';
import SettlementsPage from '../settlement/SettlementsPage/SettlementsPage';
import {
  createExpense,
  updateExpense,
  deleteExpense,
  approveDeleteExpense,
  rejectDeleteExpense,
  cancelDeleteExpense,
} from '../../services/api/expenseApi';
import {
  createSettlement,
  updateSettlement,
  confirmSettlement,
  rejectSettlement,
  cancelSettlement,
} from '../../services/api/settlementApi';
import { createProperty } from '../../services/api/propertyApi';
import { updateProfile } from '../../services/api/authApi';
import {
  sendExpensePushNotification,
  sendExpenseEditNotification,
  sendSettlementPushNotification,
} from '../../services/notifications/pushService';
import { toastEmitter } from '../../services/notifications/toastEmitter';

export default function MainDashboard({ data, onLogout }) {
  const { colors: tColors, isDark } = useTheme();
  const styles = React.useMemo(() => createAppStyles(tColors, isDark), [tColors, isDark]);

  const [activeTab, setActiveTab] = useState('home');
  const [cat, setCat] = useState('ALL');
  const [settleWith, setSettleWith] = useState(null);
  const [settlementToEdit, setSettlementToEdit] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const setM = (k) => setActiveModal(k || null);

  const pageAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    pageAnim.setValue(0);
    Animated.timing(pageAnim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [activeTab]);

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

  const onDeleteExpense = async (expenseId, reason) => {
    const propId = data.activeProperty?.id || data.activeProperty?._id;
    const res = await deleteExpense(expenseId, reason, propId);
    if (res?.status === 'deleted') {
      data.setExpenses((prev) => prev.filter((item) => (item.id !== expenseId && item._id !== expenseId)));
      data.setTotalExpenseCount((prev) => Math.max(0, (data.totalExpenseCount || prev) - 1));
      toastEmitter.emit('Expense Deleted', res.message || 'Expense removed from ledger.', 'success');
    } else if (res?.status === 'pending_approval') {
      data.setExpenses((prev) =>
        prev.map((item) =>
          item.id === expenseId || item._id === expenseId
            ? {
                ...item,
                deleteStatus: 'pending_approval',
                deleteReason: reason,
                deleteRequestedBy: data.currentUser?._id || data.currentUser?.id,
                deleteRequestedByName: data.currentUser?.name || 'Manager',
              }
            : item
        )
      );
      toastEmitter.emit('Approval Sent', 'Deletion request sent to co-managers.', 'info');
    }
    data.refresh();
    return res;
  };

  const onApproveDeleteExpense = async (expenseId) => {
    const propId = data.activeProperty?.id || data.activeProperty?._id;
    const res = await approveDeleteExpense(expenseId, propId);
    if (res?.status === 'deleted') {
      data.setExpenses((prev) => prev.filter((item) => (item.id !== expenseId && item._id !== expenseId)));
      data.setTotalExpenseCount((prev) => Math.max(0, (data.totalExpenseCount || prev) - 1));
      toastEmitter.emit('Deletion Approved', res.message || 'Expense deleted from ledger.', 'success');
    }
    data.refresh();
    return res;
  };

  const onRejectDeleteExpense = async (expenseId, reason) => {
    const res = await rejectDeleteExpense(expenseId, reason);
    data.setExpenses((prev) =>
      prev.map((item) =>
        item.id === expenseId || item._id === expenseId
          ? {
              ...item,
              deleteStatus: 'rejected',
              deleteRejectedBy: data.currentUser?._id || data.currentUser?.id,
              deleteRejectedByName: data.currentUser?.name || 'Manager',
              deleteRejectionReason: reason,
            }
          : item
      )
    );
    toastEmitter.emit('Request Rejected', 'Deletion request rejected. Expense remains active.', 'info');
    data.refresh();
    return res;
  };

  const onCancelDeleteExpense = async (expenseId) => {
    const res = await cancelDeleteExpense(expenseId);
    data.setExpenses((prev) =>
      prev.map((item) =>
        item.id === expenseId || item._id === expenseId
          ? { ...item, deleteStatus: null }
          : item
      )
    );
    toastEmitter.emit('Request Cancelled', 'Deletion request cancelled.', 'info');
    data.refresh();
    return res;
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

  const onConfirmSettlement = async (settlementId) => {
    await confirmSettlement(settlementId);
    data.refresh();
  };

  const onUpdateSettlement = async (settlementId, updates) => {
    const updated = await updateSettlement(settlementId, updates);
    data.refresh();
    data.setSettlements((prev) =>
      prev.map((s) => (s.id === settlementId || s._id === settlementId ? updated : s))
    );
  };

  const onEditSettlement = (settlement) => {
    setSettlementToEdit(settlement);
    setM('showSettle');
  };

  const onRejectSettlement = async (settlementId, reason) => {
    await rejectSettlement(settlementId, reason);
    data.refresh();
  };

  const onCancelSettlement = async (settlementId) => {
    await cancelSettlement(settlementId);
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
        onBack={activeTab !== 'home' ? () => setActiveTab('home') : null}
        title={activeTab === 'settle' ? 'Settlements Hub & Audit' : undefined}
        subtitle={activeTab === 'settle' ? data.activeProperty?.name : undefined}
        headerRightAction={
          activeTab === 'settle' ? (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingHorizontal: 10,
                paddingVertical: 5.5,
                borderRadius: 10,
                backgroundColor: isDark ? 'rgba(94, 92, 230, 0.22)' : 'rgba(94, 92, 230, 0.12)',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(94, 92, 230, 0.4)' : 'rgba(94, 92, 230, 0.25)',
                marginRight: 6,
              }}
              onPress={() => {
                if (data.balanceData?.peopleUserOwes?.length > 0) {
                  const firstOwed = data.balanceData.peopleUserOwes[0];
                  const userObj = (data.activeProperty?.managerDetails || []).find(
                    (m) => String(m.id) === String(firstOwed.userId)
                  ) || { name: 'Co-Manager', id: firstOwed.userId };
                  setSettleWith({ user: userObj, amount: firstOwed.amount, isOwedByMe: true });
                  setM('showSettle');
                } else {
                  const otherManager = (data.activeProperty?.managerDetails || []).find(
                    (m) => String(m.id) !== String(data.currentUser?._id)
                  );
                  if (otherManager) {
                    setSettleWith({ user: otherManager, amount: 0, isOwedByMe: true });
                  }
                  setM('showSettle');
                }
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={14} color={tColors.primary} />
              <Text style={{ color: tColors.primary, fontSize: 11.5, fontWeight: '700' }}>
                Settle Up
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />
      <Animated.View
        style={{
          flex: 1,
          opacity: pageAnim,
          transform: [
            {
              translateY: pageAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 0],
              }),
            },
          ],
        }}
      >
        {activeTab === 'settle' ? (
          <SettlementsPage
            settlements={data.settlements}
            currentUser={data.currentUser}
            activeProperty={data.activeProperty}
            balanceData={data.balanceData}
            onConfirmSettlement={onConfirmSettlement}
            onRejectSettlement={onRejectSettlement}
            onCancelSettlement={onCancelSettlement}
            onEditSettlement={onEditSettlement}
            onOpenSettleWithUser={(user, amount, isOwedByMe = true) => {
              setSettleWith({ user, amount, isOwedByMe });
              setM('showSettle');
            }}
            refreshing={data.refreshing}
            onRefresh={data.refresh}
            onLoadMoreSettlements={data.loadMoreSettlements}
            loadingMoreSettlements={data.loadingMoreSettlements}
          />
        ) : (
          <DashboardContent
            data={data}
            cat={cat}
            setCat={setCat}
            setM={setM}
            setSettleWith={setSettleWith}
            onConfirmSettlement={onConfirmSettlement}
            onRejectSettlement={onRejectSettlement}
            onCancelSettlement={onCancelSettlement}
            onEditSettlement={onEditSettlement}
            onOpenSettlements={() => setActiveTab('settle')}
            onSelectExpense={(exp) => {
              setSelectedExpense(exp);
              setM('showEditExpense');
            }}
          />
        )}
      </Animated.View>
      {data.activeProperty && (
        <BottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onAddExpense={() => setM('showAdd')}
          onOpenSettle={() => {
            setActiveTab('settle');
          }}
          onOpenPartners={() => setM('showInvitePartner')}
          onOpenAudit={() => setM('showAudit')}
        />
      )}
      <AppModals
        activeModal={activeModal}
        setM={setM}
        data={data}
        settleWith={settleWith}
        setSettleWith={setSettleWith}
        settlementToEdit={settlementToEdit}
        setSettlementToEdit={setSettlementToEdit}
        selectedExpense={selectedExpense}
        notifications={data.notifications || []}
        onMarkNotificationsRead={data.markNotificationsAsRead}
        onAddExpense={onAddExpense}
        onUpdateExpense={onUpdateExpense}
        onDeleteExpense={onDeleteExpense}
        onApproveDeleteExpense={onApproveDeleteExpense}
        onRejectDeleteExpense={onRejectDeleteExpense}
        onCancelDeleteExpense={onCancelDeleteExpense}
        onSettle={onSettle}
        onUpdateSettlement={onUpdateSettlement}
        onConfirmSettlement={onConfirmSettlement}
        onRejectSettlement={onRejectSettlement}
        onCancelSettlement={onCancelSettlement}
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
