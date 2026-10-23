import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomNavStyles } from './BottomNav.styles';
import { useTheme } from '../../../context/ThemeContext';

export default function BottomNav({
  activeTab = 'ledger',
  onSelectTab,
  onAddExpense,
  onOpenSettle,
  onOpenPartners,
  onOpenAudit,
}) {
  const { colors: tColors, isDark } = useTheme();
  const styles = useMemo(() => createBottomNavStyles(tColors, isDark), [tColors, isDark]);

  const activeColor = isDark ? tColors.primary : '#0F172A';
  const inactiveColor = tColors.textDim;
  const centerIconColor = isDark ? '#0C0E14' : '#FFFFFF';

  return (
    <View style={styles.container}>
      {/* 1. Home Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onSelectTab?.('home')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={activeTab === 'home' || activeTab === 'ledger' ? 'home' : 'home-outline'}
          size={20}
          color={activeTab === 'home' || activeTab === 'ledger' ? activeColor : inactiveColor}
        />
        <Text
          style={[
            styles.tabLabel,
            (activeTab === 'home' || activeTab === 'ledger') && styles.tabLabelActive,
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      {/* 2. Settle Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => {
          onSelectTab?.('settle');
          onOpenSettle?.();
        }}
        activeOpacity={0.7}
      >
        <Ionicons
          name={activeTab === 'settle' ? 'wallet' : 'wallet-outline'}
          size={20}
          color={activeTab === 'settle' ? activeColor : inactiveColor}
        />
        <Text style={[styles.tabLabel, activeTab === 'settle' && styles.tabLabelActive]}>
          Settle
        </Text>
      </TouchableOpacity>

      {/* 3. Center Quick Add Button */}
      <View style={styles.centerBtnWrap}>
        <TouchableOpacity
          style={styles.centerBtn}
          onPress={onAddExpense}
          activeOpacity={0.85}
          title="Add Expense"
        >
          <Ionicons name="add" size={26} color={centerIconColor} />
        </TouchableOpacity>
      </View>

      {/* 4. Partners Tab (Opens Invite Modal without resetting base screen tab) */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => {
          onOpenPartners?.();
        }}
        activeOpacity={0.7}
      >
        <Ionicons
          name="people-outline"
          size={20}
          color={inactiveColor}
        />
        <Text style={styles.tabLabel}>
          Partners
        </Text>
      </TouchableOpacity>

      {/* 5. Audit Tab (Opens Audit Modal without resetting base screen tab) */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => {
          onOpenAudit?.();
        }}
        activeOpacity={0.7}
      >
        <Ionicons
          name="receipt-outline"
          size={20}
          color={inactiveColor}
        />
        <Text style={styles.tabLabel}>
          Audit
        </Text>
      </TouchableOpacity>
    </View>
  );
}
