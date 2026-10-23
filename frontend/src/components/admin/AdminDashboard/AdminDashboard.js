import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createAdminDashboardStyles } from './AdminDashboard.styles';
import { useTheme } from '../../../context/ThemeContext';
import { formatCurrency } from '../../../utils/currency';
import { formatDateTime } from '../../../utils/date';
import Avatar from '../../common/Avatar/Avatar';
import {
  getAdminUsers,
  resetUserPassword,
  getAdminProperties,
  getAdminExpenses,
} from '../../../services/api/adminApi';

export default function AdminDashboard({ onLogout }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const tColors = colors;
  const styles = useMemo(() => createAdminDashboardStyles(colors, isDark), [colors, isDark]);

  const [activeTab, setActiveTab] = useState('USERS'); // 'USERS' | 'EXPENSES'
  const [loading, setLoading] = useState(true);

  // Users state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserForReset, setSelectedUserForReset] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  // Expenses & Properties state
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [expensesData, setExpensesData] = useState({ totalAmount: 0, count: 0, expenses: [] });
  const [loadingExpenses, setLoadingExpenses] = useState(false);

  // Initial Data Load
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [uList, pList] = await Promise.all([
        getAdminUsers(),
        getAdminProperties(),
      ]);
      setUsers(uList);
      setProperties(pList);
    } catch (err) {
      alert('Error loading admin data: ' + (err.message || 'Unknown'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch expenses whenever filters change
  const fetchFilteredExpenses = async (propId, uId) => {
    setLoadingExpenses(true);
    try {
      const res = await getAdminExpenses(propId, uId);
      setExpensesData(res);
    } catch (err) {
      console.error('Error querying admin expenses:', err);
    } finally {
      setLoadingExpenses(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'EXPENSES') {
      fetchFilteredExpenses(selectedPropertyId, selectedUserId);
    }
  }, [activeTab, selectedPropertyId, selectedUserId]);

  // Cascading Filter 2: Derive onboarded users based on selected property
  const availableUsersForFilter = useMemo(() => {
    if (selectedPropertyId === 'all') {
      return users;
    }
    const prop = properties.find((p) => String(p.id) === String(selectedPropertyId));
    if (!prop) return users;
    const managerIds = (prop.managers || []).map((m) => String(m.id || m._id || m));
    return users.filter((u) => managerIds.includes(String(u.id)));
  }, [selectedPropertyId, properties, users]);

  // When property filter changes, reset user filter if selected user is not in that property
  const handleSelectProperty = (propId) => {
    setSelectedPropertyId(propId);
    if (propId !== 'all') {
      const prop = properties.find((p) => String(p.id) === String(propId));
      const managerIds = (prop?.managers || []).map((m) => String(m.id || m._id || m));
      if (selectedUserId !== 'all' && !managerIds.includes(String(selectedUserId))) {
        setSelectedUserId('all');
      }
    }
  };

  // Filtered users list for Tab 1
  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q))
    );
  }, [users, userSearch]);

  // Password reset handler
  const handleResetPassword = async () => {
    if (!newPassword.trim() || newPassword.length < 4) {
      alert('Password must be at least 4 characters.');
      return;
    }
    setResetting(true);
    try {
      const res = await resetUserPassword(selectedUserForReset.id, newPassword.trim());
      const loginIdentifier = selectedUserForReset.email || selectedUserForReset.username;
      const successMsg = `Password for ${selectedUserForReset.name} updated successfully!\n\nRegistered Login Email:\n${loginIdentifier}\n\nNew Password:\n${newPassword.trim()}`;
      if (Platform.OS === 'web') {
        window.alert(successMsg);
      } else {
        Alert.alert('Password Reset Success', successMsg);
      }
      setSelectedUserForReset(null);
      setNewPassword('');
    } catch (err) {
      alert(err.message || 'Failed to reset password.');
    } finally {
      setResetting(false);
    }
  };

  const generateQuickPassword = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setNewPassword(`AirPass#${randomNum}`);
  };

  return (
    <View style={styles.container}>
      {/* Admin Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
            <Text style={styles.adminBadgeText}>ADMIN PORTAL</Text>
          </View>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Airbnb System Admin
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={16}
              color={tColors.textDark}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={onLogout}
            title="Logout"
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={17} color={tColors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.navTab, activeTab === 'USERS' && styles.navTabActive]}
          onPress={() => setActiveTab('USERS')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="people-outline"
            size={16}
            color={activeTab === 'USERS' ? tColors.primary : tColors.textMuted}
          />
          <Text style={[styles.navTabText, activeTab === 'USERS' && styles.navTabTextActive]}>
            Users & Passwords ({users.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, activeTab === 'EXPENSES' && styles.navTabActive]}
          onPress={() => setActiveTab('EXPENSES')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="receipt-outline"
            size={16}
            color={activeTab === 'EXPENSES' ? tColors.primary : tColors.textMuted}
          />
          <Text style={[styles.navTabText, activeTab === 'EXPENSES' && styles.navTabTextActive]}>
            Property Expenses Explorer
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={tColors.primary} />
          <Text style={{ color: tColors.textMuted, marginTop: 12, fontSize: 13 }}>
            Connecting to system database...
          </Text>
        </View>
      ) : activeTab === 'USERS' ? (
        /* TAB 1: USERS & PASSWORD RESET */
        <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Registered Users</Text>
            <TouchableOpacity onPress={loadInitialData}>
              <Ionicons name="refresh" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={16} color={colors.textDim} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search user by name, email or username..."
              placeholderTextColor={colors.textDim}
              value={userSearch}
              onChangeText={setUserSearch}
            />
            {Boolean(userSearch) && (
              <TouchableOpacity onPress={() => setUserSearch('')}>
                <Ionicons name="close-circle" size={16} color={colors.textDim} />
              </TouchableOpacity>
            )}
          </View>

          {filteredUsers.length === 0 ? (
            <Text style={{ color: colors.textMuted, textAlign: 'center', paddingVertical: 24 }}>
              No users found matching "{userSearch}".
            </Text>
          ) : (
            filteredUsers.map((u) => (
              <View key={u.id} style={styles.userCard}>
                <View style={styles.userCardTop}>
                  <View style={styles.userInfoLeft}>
                    <Avatar name={u.name} initials={u.initials} color={u.color} size={38} />
                    <View>
                      <Text style={styles.userName}>{u.name}</Text>
                      <Text style={styles.userEmail}>{u.email || u.username}</Text>
                      <View
                        style={[
                          styles.roleBadge,
                          u.role === 'admin' ? styles.roleAdmin : styles.roleUser,
                        ]}
                      >
                        <Text
                          style={[
                            styles.roleText,
                            { color: u.role === 'admin' ? colors.primary : colors.textMuted },
                          ]}
                        >
                          {u.role || 'user'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.resetBtn}
                    onPress={() => {
                      setSelectedUserForReset(u);
                      setNewPassword('');
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="key-outline" size={13} color={colors.warning} />
                    <Text style={styles.resetBtnText}>Reset Password</Text>
                  </TouchableOpacity>
                </View>

                {/* Properties Tag List */}
                {u.properties && u.properties.length > 0 && (
                  <View style={styles.propsChipRow}>
                    <Text style={{ color: colors.textDim, fontSize: 10.5, fontWeight: '700' }}>
                      PROPERTIES:
                    </Text>
                    {u.properties.map((p) => (
                      <View key={p.id} style={styles.propChip}>
                        <Text style={styles.propChipText}>{p.name}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      ) : (
        /* TAB 2: CASCADING EXPENSES EXPLORER */
        <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
          {/* CASCADING FILTER BOX */}
          <View style={styles.filterBox}>
            {/* Filter 1: Property */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>1. Filter by Property</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                <TouchableOpacity
                  style={[styles.chip, selectedPropertyId === 'all' && styles.chipActive]}
                  onPress={() => handleSelectProperty('all')}
                >
                  <Text style={[styles.chipText, selectedPropertyId === 'all' && styles.chipTextActive]}>
                    All Properties ({properties.length})
                  </Text>
                </TouchableOpacity>

                {properties.map((p) => {
                  const isActive = String(selectedPropertyId) === String(p.id);
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => handleSelectProperty(p.id)}
                    >
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                        {p.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Filter 2: Onboarded Users (Cascaded based on Filter 1) */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>
                2. Filter by Onboarded User{' '}
                {selectedPropertyId !== 'all' && '(Scoped to Property)'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                <TouchableOpacity
                  style={[styles.chip, selectedUserId === 'all' && styles.chipActive]}
                  onPress={() => setSelectedUserId('all')}
                >
                  <Text style={[styles.chipText, selectedUserId === 'all' && styles.chipTextActive]}>
                    All Users ({availableUsersForFilter.length})
                  </Text>
                </TouchableOpacity>

                {availableUsersForFilter.map((u) => {
                  const isActive = String(selectedUserId) === String(u.id);
                  return (
                    <TouchableOpacity
                      key={u.id}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => setSelectedUserId(u.id)}
                    >
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                        {u.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Quick Stats Summary */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Spend</Text>
              <Text style={[styles.statVal, { color: colors.primary }]}>
                {formatCurrency(expensesData.totalAmount)}
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Expenses Logged</Text>
              <Text style={styles.statVal}>{expensesData.count}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Average Item</Text>
              <Text style={styles.statVal}>
                {expensesData.count > 0
                  ? formatCurrency(Math.round(expensesData.totalAmount / expensesData.count))
                  : '₹0'}
              </Text>
            </View>
          </View>

          {/* Expenses List */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Expenses ({expensesData.count})
            </Text>
            {loadingExpenses && <ActivityIndicator size="small" color={colors.primary} />}
          </View>

          {expensesData.expenses.length === 0 ? (
            <Text style={{ color: colors.textMuted, textAlign: 'center', paddingVertical: 32 }}>
              No expenses matching the selected property and user filters.
            </Text>
          ) : (
            expensesData.expenses.map((exp) => (
              <View key={exp.id} style={styles.expenseCard}>
                <View style={styles.expensePropTag}>
                  <Ionicons name="business-outline" size={12} color={colors.primary} />
                  <Text style={styles.expensePropText}>{exp.propertyName}</Text>
                </View>

                <View style={styles.expenseCardTop}>
                  <Text style={styles.expenseTitle}>{exp.title}</Text>
                  <Text style={styles.expenseAmount}>{formatCurrency(exp.amount)}</Text>
                </View>

                <View style={styles.expenseMeta}>
                  <Text style={styles.expensePayer}>
                    Paid by <Text style={{ color: colors.textDark, fontWeight: '700' }}>{exp.payerName}</Text>
                  </Text>
                  <Text style={styles.expenseDate}>{exp.date || exp.createdAt ? formatDateTime(exp.date || exp.createdAt) : ''}</Text>
                </View>

                {exp.splitNames && exp.splitNames.length > 0 && (
                  <Text style={styles.splitSummary}>
                    Split among: {exp.splitNames.join(', ')} (₹{Math.round(exp.sharePerPerson)}/person)
                  </Text>
                )}

                {Boolean(exp.notes) && (
                  <Text style={{ color: colors.textDim, fontSize: 11, marginTop: 4 }}>
                    Note: "{exp.notes}"
                  </Text>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Password Reset Modal */}
      {selectedUserForReset && (
        <Modal visible={true} transparent animationType="fade" onRequestClose={() => setSelectedUserForReset(null)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Reset User Password</Text>
                <TouchableOpacity onPress={() => setSelectedUserForReset(null)} disabled={resetting}>
                  <Ionicons name="close" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSub}>
                Resetting password for{' '}
                <Text style={{ color: colors.white, fontWeight: '800' }}>
                  {selectedUserForReset.name}
                </Text>
              </Text>

              <View style={{ backgroundColor: 'rgba(94, 92, 230, 0.12)', borderColor: 'rgba(94, 92, 230, 0.35)', borderWidth: 1, borderRadius: 8, padding: 10, marginVertical: 10 }}>
                <Text style={{ color: colors.textMuted, fontSize: 10.5, fontWeight: '700', letterSpacing: 0.5 }}>
                  REGISTERED LOGIN EMAIL
                </Text>
                <Text style={{ color: colors.white, fontSize: 13, fontWeight: '700', marginTop: 3 }} selectable={true}>
                  {selectedUserForReset.email || selectedUserForReset.username}
                </Text>
                <Text style={{ color: colors.primary, fontSize: 10.5, marginTop: 4 }}>
                  * The user must sign in with this exact email.
                </Text>
              </View>

              <TextInput
                style={styles.modalInput}
                placeholder="Enter new password (min 4 chars)"
                placeholderTextColor={colors.textDim}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={false}
                autoCapitalize="none"
                editable={!resetting}
              />

              <TouchableOpacity style={styles.quickGenBtn} onPress={generateQuickPassword}>
                <Ionicons name="sparkles-outline" size={14} color={tColors.primary} />
                <Text style={styles.quickGenText}>Generate Random Password</Text>
              </TouchableOpacity>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setSelectedUserForReset(null)}
                  disabled={resetting}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, resetting && { opacity: 0.8 }]}
                  onPress={handleResetPassword}
                  disabled={resetting}
                  activeOpacity={0.8}
                >
                  {resetting ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={styles.modalSubmitText}>Save Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
