import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../styles/app.styles';
import { colors } from '../../theme/colors';
import BalanceCard from '../balance/BalanceCard/BalanceCard';
import WhoOwesWhoCard from '../balance/WhoOwesWho/WhoOwesWhoCard';
import CategoryFilters from '../expenses/CategoryFilters/CategoryFilters';
import ExpenseList from '../expenses/ExpenseList/ExpenseList';
import CsvExportButton from '../audit/CsvExportButton/CsvExportButton';

export default function DashboardContent({ data, cat, setCat, setM, setSettleWith, onSelectExpense }) {
  const filtered = data.expenses.filter((e) => (cat === 'ALL' ? true : e.category === cat));
  const userMap = {};
  if (data.currentUser) userMap[data.currentUser._id || data.currentUser.id] = data.currentUser;
  data.activeProperty?.managerDetails?.forEach((m) => {
    userMap[m.id] = m;
  });

  const renderLoading = () => (
    <View style={[styles.emptyBox, { paddingVertical: 64 }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.emptyTitle, { marginTop: 18 }]}>Loading Airbnb Workspace...</Text>
      <Text style={styles.emptySub}>
        Connecting to database and loading properties, balances & expenses.
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyBox}>
      <Ionicons name="business" size={44} color={colors.primary} />
      <Text style={styles.emptyTitle}>No Properties Configured</Text>
      <Text style={styles.emptySub}>
        Create your Airbnb property or join a partner's property using an invite code.
      </Text>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
        <TouchableOpacity style={styles.emptyBtn} onPress={() => setM('showAddProp', true)}>
          <Text style={styles.emptyBtnText}>+ Create Property</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.emptyBtn, { backgroundColor: '#0284C7' }]}
          onPress={() => setM('showAcceptInvite', true)}
        >
          <Text style={styles.emptyBtnText}>🔑 Join via Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={data.refreshing}
          onRefresh={data.refresh}
          tintColor={colors.primary}
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
            onAddExpense={() => setM('showAdd', true)}
            onSettleUp={() => {
              if (data.balanceData?.peopleUserOwes?.length > 0) {
                setSettleWith({
                  user: { name: 'Manager' },
                  amount: data.balanceData.peopleUserOwes[0].amount,
                });
                setM('showSettle', true);
              }
            }}
          />
          <WhoOwesWhoCard
            balanceData={data.balanceData}
            userMap={userMap}
            onSettleWithUser={(user, amount) => {
              setSettleWith({ user, amount });
              setM('showSettle', true);
            }}
          />
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleBox}>
              <Text style={styles.title}>Logged Expenses</Text>
              <Text style={styles.sub}>{data.expenses.length} expenses • Splitwise split</Text>
            </View>
            <View style={styles.headerActions}>
              <CsvExportButton
                expenses={data.expenses}
                property={data.activeProperty}
                settlements={data.settlements}
                userMap={userMap}
              />
              <TouchableOpacity style={styles.btn} onPress={() => setM('showHistory', true)}>
                <Ionicons name="receipt-outline" size={12} color={colors.textDark} />
                <Text style={styles.btnText}>Audit Log</Text>
              </TouchableOpacity>
            </View>
          </View>

          {data.loadingDetails && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10 }}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ fontSize: 12, color: colors.textMuted }}>Syncing property expenses...</Text>
            </View>
          )}

          <CategoryFilters selectedCategory={cat} onSelectCategory={setCat} />
          <ExpenseList expenses={filtered} userMap={userMap} onSelectExpense={onSelectExpense} />
        </>
      )}
      <View style={{ height: 80 }} />
    </ScrollView>
  );
}
