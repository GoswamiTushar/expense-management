import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../styles/app.styles';
import { colors } from '../../theme/colors';
import BalanceCard from '../balance/BalanceCard/BalanceCard';
import WhoOwesWhoCard from '../balance/WhoOwesWho/WhoOwesWhoCard';
import CategoryFilters from '../expenses/CategoryFilters/CategoryFilters';
import ExpenseList from '../expenses/ExpenseList/ExpenseList';
import CsvExportButton from '../audit/CsvExportButton/CsvExportButton';

export default function DashboardContent({ data, cat, setCat, setM, setSettleWith }) {
  const filtered = data.expenses.filter((e) => (cat === 'ALL' ? true : e.category === cat));
  const userMap = {};
  if (data.currentUser) userMap[data.currentUser._id || data.currentUser.id] = data.currentUser;
  data.activeProperty?.managerDetails?.forEach((m) => { userMap[m.id] = m; });

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={data.refreshing} onRefresh={data.refresh} tintColor={colors.primary} />}>
      {!data.activeProperty ? (
        <View style={styles.emptyBox}>
          <Ionicons name="business" size={44} color={colors.primary} />
          <Text style={styles.emptyTitle}>No Properties Configured</Text>
          <Text style={styles.emptySub}>Create your Airbnb property or join a partner's property using an invite code.</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setM('showAddProp', true)}><Text style={styles.emptyBtnText}>+ Create Property</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.emptyBtn, { backgroundColor: '#0284C7' }]} onPress={() => setM('showAcceptInvite', true)}><Text style={styles.emptyBtnText}>🔑 Join via Code</Text></TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <BalanceCard property={data.activeProperty} balanceData={data.balanceData} onAddExpense={() => setM('showAdd', true)} onSettleUp={() => { if (data.balanceData?.peopleUserOwes?.length > 0) { setSettleWith({ user: { name: 'Manager' }, amount: data.balanceData.peopleUserOwes[0].amount }); setM('showSettle', true); } }} />
          <WhoOwesWhoCard balanceData={data.balanceData} userMap={userMap} onSettleWithUser={(user, amount) => { setSettleWith({ user, amount }); setM('showSettle', true); }} />
          <View style={styles.sectionHeader}>
            <View><Text style={styles.title}>Logged Expenses</Text><Text style={styles.sub}>{data.expenses.length} expenses • Splitwise selection</Text></View>
            <View style={styles.headerActions}><CsvExportButton expenses={data.expenses} propertyName={data.activeProperty?.name} /><TouchableOpacity style={styles.btn} onPress={() => setM('showHistory', true)}><Text style={styles.btnText}>Settlement Audit</Text></TouchableOpacity></View>
          </View>
          <CategoryFilters selectedCategory={cat} onSelectCategory={setCat} />
          <ExpenseList expenses={filtered} />
        </>
      )}
      <View style={{ height: 80 }} />
    </ScrollView>
  );
}
