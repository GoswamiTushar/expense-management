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

export default function AppModals({ modals, data, settleWith, onAddExpense, onSettle, onCreateProperty, onSaveProfile, onLogout, onInviteSuccess, onAcceptInviteSuccess }) {
  return (
    <>
      <AddExpenseModal visible={modals.showAdd} onClose={() => modals.setShowAdd(false)} onSubmit={onAddExpense} property={data.activeProperty} currentUser={data.currentUser} />
      <SettleUpModal visible={modals.showSettle} onClose={() => modals.setShowSettle(false)} onSubmit={onSettle} creditor={settleWith?.user} debtor={data.currentUser} property={data.activeProperty} defaultAmount={settleWith?.amount} />
      <PropertyPickerModal visible={modals.showPropPicker} onClose={() => modals.setShowPropPicker(false)} properties={data.properties} activeProperty={data.activeProperty} onSelectProperty={data.setActiveProperty} onOpenAddProperty={() => modals.setShowAddProp(true)} />
      <AddPropertyModal visible={modals.showAddProp} onClose={() => modals.setShowAddProp(false)} onSubmit={onCreateProperty} currentUser={data.currentUser} />
      <NotificationDrawerModal visible={modals.showNotifs} onClose={() => modals.setShowNotifs(false)} />
      <SettlementHistoryModal visible={modals.showHistory} onClose={() => modals.setShowHistory(false)} settlements={data.settlements} />
      <ChronoAuditLogModal visible={modals.showAudit} onClose={() => modals.setShowAudit(false)} expenses={data.expenses} />
      <EditProfileModal visible={modals.showProfile} onClose={() => modals.setShowProfile(false)} currentUser={data.currentUser} onSaveProfile={onSaveProfile} onLogout={onLogout} />
      <InvitePartnerModal visible={modals.showInvitePartner} onClose={() => modals.setShowInvitePartner(false)} property={data.activeProperty} currentUser={data.currentUser} onSuccess={onInviteSuccess} />
      <AcceptInviteModal visible={modals.showAcceptInvite} onClose={() => modals.setShowAcceptInvite(false)} onSuccess={onAcceptInviteSuccess} />
    </>
  );
}
