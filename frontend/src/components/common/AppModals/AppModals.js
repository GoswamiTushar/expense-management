import React from 'react';
import AddExpenseModal from '../../expenses/AddExpenseModal/AddExpenseModal';
import SettleUpModal from '../../settlement/SettleUpModal/SettleUpModal';
import SettlementHistoryModal from '../../settlement/SettlementHistory/SettlementHistoryModal';
import PropertyPickerModal from '../../property/PropertyPickerModal/PropertyPickerModal';
import AddPropertyModal from '../../property/AddPropertyModal/AddPropertyModal';
import NotificationDrawerModal from '../../notifications/NotificationDrawer/NotificationDrawerModal';
import ChronoAuditLogModal from '../../audit/ChronoAuditLogModal/ChronoAuditLogModal';
import EditProfileModal from '../../profile/EditProfileModal/EditProfileModal';
import InvitePartnerModal from '../../property/InvitePartnerModal/InvitePartnerModal';
import { AcceptInviteModal } from '../../auth/AcceptInviteModal/AcceptInviteModal';

export default function AppModals({ activeModal, setM, data, settleWith, onAddExpense, onSettle, onCreateProperty, onSaveProfile, onLogout, onInviteSuccess, onAcceptInviteSuccess }) {
  const close = () => setM(null);
  return (
    <>
      <AddExpenseModal visible={activeModal === 'showAdd'} onClose={close} onSubmit={onAddExpense} property={data.activeProperty} currentUser={data.currentUser} />
      <SettleUpModal visible={activeModal === 'showSettle'} onClose={close} onSubmit={onSettle} creditor={settleWith?.user} debtor={data.currentUser} property={data.activeProperty} defaultAmount={settleWith?.amount} />
      <PropertyPickerModal visible={activeModal === 'showPropPicker'} onClose={close} properties={data.properties} activeProperty={data.activeProperty} onSelectProperty={data.setActiveProperty} onOpenAddProperty={() => setM('showAddProp')} onOpenJoinInvite={() => setM('showAcceptInvite')} />
      <AddPropertyModal visible={activeModal === 'showAddProp'} onClose={close} onSubmit={onCreateProperty} currentUser={data.currentUser} />
      <NotificationDrawerModal visible={activeModal === 'showNotifs'} onClose={close} />
      <SettlementHistoryModal visible={activeModal === 'showHistory'} onClose={close} settlements={data.settlements} />
      <ChronoAuditLogModal visible={activeModal === 'showAudit'} onClose={close} expenses={data.expenses} />
      <EditProfileModal visible={activeModal === 'showProfile'} onClose={close} currentUser={data.currentUser} onSaveProfile={onSaveProfile} onLogout={onLogout} />
      <InvitePartnerModal visible={activeModal === 'showInvitePartner'} onClose={close} property={data.activeProperty} currentUser={data.currentUser} onSuccess={onInviteSuccess} />
      <AcceptInviteModal visible={activeModal === 'showAcceptInvite'} onClose={close} onSuccess={onAcceptInviteSuccess} currentUser={data.currentUser} />
    </>
  );
}
