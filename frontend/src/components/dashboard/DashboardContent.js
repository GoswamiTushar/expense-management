import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createAppStyles } from '../../styles/app.styles';
import { useTheme } from '../../context/ThemeContext';
import BalanceCard from '../balance/BalanceCard/BalanceCard';
import WhoOwesWhoCard from '../balance/WhoOwesWho/WhoOwesWhoCard';
import PendingSettlementsCard from '../settlement/PendingSettlementsCard/PendingSettlementsCard';
import CategoryFilters from '../expenses/CategoryFilters/CategoryFilters';
import ExpenseList from '../expenses/ExpenseList/ExpenseList';
import ExportButton from '../export/ExportButton';

export default function DashboardContent({
  data,
  cat,
  setCat,
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

  const filtered = data.expenses
    .filter((e) => !e.isDeleted && !e.deleted && e.deleted !== 'Y' && e.isDeleted !== 'Y')
    .filter((e) => (cat === 'ALL' ? true : e.category === cat));
  const userMap = {};
  if (data.currentUser) userMap[data.currentUser._id || data.currentUser.id] = data.currentUser;
  data.activeProperty?.managerDetails?.forEach((m) => {
    userMap[m.id] = m;
  });

  const renderLoading = () => (
    <View style={[styles.emptyBox, { paddingVertical: 64 }]}>
      <ActivityIndicator size="large" color={tColors.primary} />
      <Text style={[styles.emptyTitle, { marginTop: 18 }]}>Loading Airbnb Workspace...</Text>
      <Text style={styles.emptySub}>
        Connecting to database and loading properties, balances & expenses.
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyBox}>
      <Ionicons name="business" size={44} color={tColors.primary} />
      <Text style={styles.emptyTitle}>No Properties Configured</Text>
      <Text style={styles.emptySub}>
        Create your Airbnb property or join a partner's property using an invite code.
      </Text>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
        <TouchableOpacity style={styles.emptyBtn} onPress={() => setM('showAddProp', true)} activeOpacity={0.85}>
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.emptyBtnText}>Create Property</Text>
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
                {data.totalExpenseCount || data.expenses.length} expenses • Splitwise split
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
              <Text style={{ fontSize: 12, color: tColors.textMuted }}>Syncing property expenses...</Text>
            </View>
          )}

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
