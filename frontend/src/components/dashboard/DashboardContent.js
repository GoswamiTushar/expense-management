import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createAppStyles } from '../../styles/app.styles';
import { useTheme } from '../../context/ThemeContext';
import BalanceCard from '../balance/BalanceCard/BalanceCard';
import WhoOwesWhoCard from '../balance/WhoOwesWho/WhoOwesWhoCard';
import PendingSettlementsCard from '../settlement/PendingSettlementsCard/PendingSettlementsCard';
import CategoryFilters from '../expenses/CategoryFilters/CategoryFilters';
import MemberFilters from '../expenses/MemberFilters/MemberFilters';
import ExpenseList from '../expenses/ExpenseList/ExpenseList';
import ExportButton from '../export/ExportButton';

export default function DashboardContent({
  data,
  cat,
  setCat,
  selectedMember = 'ALL',
  setSelectedMember = () => {},
  setM,
  setSettleWith,
  onConfirmSettlement,
  onRejectSettlement,
  onCancelSettlement,
  onEditSettlement,
  onOpenSettlements,
  onSelectExpense,
}) {
  const { colors: tColors, isDark } = useTheme();
  const styles = useMemo(() => createAppStyles(tColors, isDark), [tColors, isDark]);

  const userMap = useMemo(() => {
    const map = {};
    if (data.currentUser) map[data.currentUser._id || data.currentUser.id] = data.currentUser;
    data.activeProperty?.managerDetails?.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [data.currentUser, data.activeProperty]);

  const members = useMemo(() => {
    const list = [];
    const seen = new Set();
    if (data.currentUser) {
      const id = String(data.currentUser._id || data.currentUser.id);
      seen.add(id);
      list.push({ id, name: data.currentUser.name || 'You', isMe: true });
    }
    (data.activeProperty?.managerDetails || []).forEach((m) => {
      const id = String(m.id || m._id);
      if (!seen.has(id)) {
        seen.add(id);
        list.push({ id, name: m.name || 'Member', isMe: false });
      }
    });
    return list;
  }, [data.currentUser, data.activeProperty]);

  // Exact database-aggregated expense counts across entire group collection
  const expenseCountsByMember = data.expenseCountsByMember || {};

  const filtered = useMemo(() => {
    return (data.expenses || [])
      .filter((e) => !e.isDeleted && !e.deleted && e.deleted !== 'Y' && e.isDeleted !== 'Y')
      .filter((e) => (cat === 'ALL' ? true : e.category === cat))
      .filter((e) => (selectedMember === 'ALL' ? true : String(e.paidBy) === String(selectedMember)));
  }, [data.expenses, cat, selectedMember]);

  const renderLoading = () => (
    <View style={[styles.emptyBox, { paddingVertical: 64 }]}>
      <ActivityIndicator size="large" color={tColors.primary} />
      <Text style={[styles.emptyTitle, { marginTop: 18 }]}>Loading Workspace...</Text>
      <Text style={styles.emptySub}>
        Connecting to database and loading expenses & balances.
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyBox}>
      <Ionicons name="folder-open-outline" size={44} color={tColors.primary} />
      <Text style={styles.emptyTitle}>No Group Selected</Text>
      <Text style={styles.emptySub}>
        Create a group (trips, flatmates, or vacation rentals) or join with an invite code.
      </Text>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
        <TouchableOpacity style={styles.emptyBtn} onPress={() => setM('showAddProp', true)} activeOpacity={0.85}>
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.emptyBtnText}>Create New</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.emptyBtn, { backgroundColor: tColors.info }]}
          onPress={() => setM('showAcceptInvite', true)}
          activeOpacity={0.85}
        >
          <Ionicons name="key-outline" size={15} color="#FFFFFF" />
          <Text style={styles.emptyBtnText}>Join via Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1 }}
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        // Facebook-style infinite scroll: auto load next batch seamlessly near end
        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 200) {
          if (data.loadMoreExpenses) {
            data.loadMoreExpenses();
          }
        }
      }}
      scrollEventThrottle={32}
      refreshControl={
        <RefreshControl
          refreshing={data.refreshing}
          onRefresh={data.refresh}
          tintColor={tColors.primary}
        />
      }
    >
      {data.loading ? (
        renderLoading()
      ) : !data.activeProperty ? (
        renderEmpty()
      ) : (
        <>
          {data.activeProperty?.isArchived && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: isDark ? 'rgba(255, 159, 10, 0.16)' : '#FFF3E0',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255, 159, 10, 0.35)' : '#FFE0B2',
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 10,
                marginBottom: 14,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <Ionicons name="archive-outline" size={18} color="#FF9F0A" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#FFD60A' : '#E65100' }}>
                    Archived Group
                  </Text>
                  <Text style={{ fontSize: 11.5, color: isDark ? '#D1D5DB' : '#5D4037' }}>
                    Balances and logs are preserved.
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => data.archiveGroup?.(data.activeProperty?._id || data.activeProperty?.id, false)}
                style={{
                  backgroundColor: '#34C759',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  marginLeft: 8,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>Unarchive</Text>
              </TouchableOpacity>
            </View>
          )}
          <BalanceCard
            property={data.activeProperty}
            balanceData={data.balanceData}
            expenses={data.expenses}
            userMap={userMap}
            currentUser={data.currentUser}
          />
          <PendingSettlementsCard
            pendingIncoming={data.balanceData?.pendingIncoming || []}
            pendingOutgoing={data.balanceData?.pendingOutgoing || []}
            onConfirm={onConfirmSettlement}
            onReject={onRejectSettlement}
            onCancel={onCancelSettlement}
            onEdit={onEditSettlement}
            onOpenHistory={onOpenSettlements}
          />
          <WhoOwesWhoCard
            balanceData={data.balanceData}
            userMap={userMap}
            onSettleWithUser={(user, amount, isOwedByMe = true) => {
              setSettleWith({ user, amount, isOwedByMe });
              setM('showSettle', true);
            }}
          />
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleBox}>
              <Text style={styles.title}>
                Logged Expenses ({data.totalExpenseCount || data.expenses.length})
              </Text>
              <Text style={styles.sub}>
                {data.totalExpenseCount || data.expenses.length} expenses
              </Text>
            </View>
            <View style={styles.headerActions}>
              <ExportButton
                expenses={data.expenses}
                property={data.activeProperty}
                settlements={data.settlements}
                userMap={userMap}
              />
            </View>
          </View>

          {data.loadingDetails && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10 }}>
              <ActivityIndicator size="small" color={tColors.primary} />
              <Text style={{ fontSize: 12, color: tColors.textMuted }}>Syncing expenses...</Text>
            </View>
          )}

          {/* Dynamic Group Member Filter */}
          <MemberFilters
            members={members}
            selectedMember={selectedMember}
            onSelectMember={setSelectedMember}
            expenseCountsByMember={expenseCountsByMember}
          />

          <CategoryFilters selectedCategory={cat} onSelectCategory={setCat} />
          <ExpenseList expenses={filtered} userMap={userMap} onSelectExpense={onSelectExpense} />

          {data.loadingMoreExpenses && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 18,
              }}
            >
              <ActivityIndicator size="small" color={tColors.primary} />
              <Text
                style={{
                  fontSize: 12.5,
                  fontWeight: '600',
                  color: tColors.textMuted,
                  letterSpacing: -0.2,
                }}
              >
                Loading more expenses...
              </Text>
            </View>
          )}
        </>
      )}
      <View style={{ height: 110 }} />
    </ScrollView>
  );
}
